import { createClient } from 'jsr:@supabase/supabase-js@2'

import { verifyAdminSessionToken } from '../_shared/admin-session.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

function normalizeObjectName(fileName: string) {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || 'resultado.webp'
}

function sizeFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') {
    return 0
  }

  const value = (metadata as { size?: unknown }).size
  return typeof value === 'number' ? value : 0
}

async function calculateBucketUsageBytes(
  supabase: ReturnType<typeof createClient>,
  bucketName: string
) {
  const pendingPrefixes: string[] = ['']
  let usedBytes = 0

  while (pendingPrefixes.length > 0) {
    const prefix = pendingPrefixes.shift() ?? ''
    let offset = 0

    while (true) {
      const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })

      if (error) {
        return { usedBytes: 0, error }
      }

      const entries = data ?? []

      for (const entry of entries) {
        const metadataSize = sizeFromMetadata((entry as { metadata?: unknown }).metadata)
        const entryName = (entry as { name?: string }).name ?? ''
        const hasFileId = Boolean((entry as { id?: string | null }).id)

        if (metadataSize > 0 || hasFileId) {
          usedBytes += metadataSize
          continue
        }

        if (entryName) {
          pendingPrefixes.push(prefix ? `${prefix}/${entryName}` : entryName)
        }
      }

      if (entries.length < 100) {
        break
      }

      offset += 100
    }
  }

  return { usedBytes, error: null }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido.' }, { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const sessionSecret = Deno.env.get('ADMIN_SESSION_SECRET')
  const bucketName = Deno.env.get('IMAGES_BUCKET_NAME') || 'imagenes'
  const maxBucketBytes = Number(Deno.env.get('MAX_BUCKET_BYTES') || 50 * 1024 * 1024)

  if (!supabaseUrl || !serviceRoleKey || !sessionSecret) {
    return jsonResponse(
      { error: 'Falta configurar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o ADMIN_SESSION_SECRET.' },
      { status: 500 }
    )
  }

  const formData = await request.formData().catch(() => null)
  const token = typeof formData?.get('token') === 'string' ? String(formData.get('token')) : ''
  const file = formData?.get('file')

  if (!token) {
    return jsonResponse({ error: 'Sesion de administrador no enviada.' }, { status: 401 })
  }

  const session = await verifyAdminSessionToken(token, sessionSecret)

  if (!session) {
    return jsonResponse({ error: 'Sesion invalida o vencida.' }, { status: 401 })
  }

  if (!(file instanceof File)) {
    return jsonResponse({ error: 'No se recibio ninguna imagen.' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return jsonResponse({ error: 'Solo se permiten archivos de imagen.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const usageResult = await calculateBucketUsageBytes(supabase, bucketName)

  if (usageResult.error) {
    return jsonResponse(
      {
        error: `No fue posible verificar el espacio disponible. (${usageResult.error.message})`,
      },
      { status: 500 }
    )
  }

  const usedBytes = usageResult.usedBytes

  if (usedBytes + file.size > maxBucketBytes) {
    return jsonResponse(
      {
        error: 'No hay suficiente espacio disponible para publicar esta imagen. Elimina alguna imagen existente e intenta de nuevo.',
        usedBytes,
        remainingBytes: Math.max(maxBucketBytes - usedBytes, 0),
        maxBytes: maxBucketBytes,
      },
      { status: 413 }
    )
  }

  const objectPath = `admin/${session.sub}/${Date.now()}-${crypto.randomUUID()}-${normalizeObjectName(file.name)}`

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: '3600',
  })

  if (uploadError) {
    return jsonResponse({ error: 'No fue posible subir el archivo al bucket.' }, { status: 500 })
  }

  const { data: imageRow, error: insertError } = await supabase
    .from('imagenes')
    .insert({
      nombre: file.name,
      ruta: objectPath,
      usuario_id: session.sub,
    })
    .select('id, nombre, ruta, fecha, usuario_id')
    .single()

  if (insertError) {
    await supabase.storage.from(bucketName).remove([objectPath])
    return jsonResponse({ error: 'No fue posible guardar la referencia de la imagen.' }, { status: 500 })
  }

  const publicUrl = supabase.storage.from(bucketName).getPublicUrl(objectPath).data.publicUrl
  const nextUsedBytes = usedBytes + file.size

  return jsonResponse({
    item: {
      ...imageRow,
      publicUrl,
    },
    usedBytes: nextUsedBytes,
    remainingBytes: Math.max(maxBucketBytes - nextUsedBytes, 0),
    maxBytes: maxBucketBytes,
  })
})
