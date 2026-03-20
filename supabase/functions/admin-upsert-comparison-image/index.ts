/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2'

import { verifyAdminSessionToken } from '../_shared/admin-session.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

type ComparisonSlot = 'before' | 'after'

function normalizeObjectName(fileName: string) {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || 'comparador.webp'
}

function readSlot(value: unknown): ComparisonSlot | null {
  if (value === 'before' || value === 'after') {
    return value
  }

  return null
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

  if (!supabaseUrl || !serviceRoleKey || !sessionSecret) {
    return jsonResponse(
      { error: 'Falta configurar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o ADMIN_SESSION_SECRET.' },
      { status: 500 }
    )
  }

  const formData = await request.formData().catch(() => null)
  const token = typeof formData?.get('token') === 'string' ? String(formData.get('token')) : ''
  const slot = readSlot(formData?.get('slot'))
  const file = formData?.get('file')

  if (!token) {
    return jsonResponse({ error: 'Sesion de administrador no enviada.' }, { status: 401 })
  }

  const session = await verifyAdminSessionToken(token, sessionSecret)

  if (!session) {
    return jsonResponse({ error: 'Sesion invalida o vencida.' }, { status: 401 })
  }

  if (!slot) {
    return jsonResponse({ error: 'Debes indicar si la imagen es before o after.' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return jsonResponse({ error: 'No se recibio ninguna imagen.' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return jsonResponse({ error: 'Solo se permiten archivos de imagen.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const filesToDelete: string[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(bucketName).list('comparador', {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      return jsonResponse({ error: 'No se pudo leer el contenido del comparador.' }, { status: 500 })
    }

    const entries = data ?? []

    for (const entry of entries) {
      const name = (entry as { name?: string }).name || ''

      if (name.startsWith(`${slot}-`)) {
        filesToDelete.push(`comparador/${name}`)
      }
    }

    if (entries.length < 100) {
      break
    }

    offset += 100
  }

  if (filesToDelete.length > 0) {
    const { error: removeError } = await supabase.storage.from(bucketName).remove(filesToDelete)

    if (removeError) {
      return jsonResponse({ error: 'No se pudo reemplazar la imagen anterior del comparador.' }, { status: 500 })
    }
  }

  const objectPath = `comparador/${slot}-${Date.now()}-${crypto.randomUUID()}-${normalizeObjectName(file.name)}`

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: '3600',
  })

  if (uploadError) {
    return jsonResponse({ error: 'No se pudo subir la imagen del comparador.' }, { status: 500 })
  }

  const publicUrl = supabase.storage.from(bucketName).getPublicUrl(objectPath).data.publicUrl

  return jsonResponse({
    slot,
    path: objectPath,
    publicUrl: `${publicUrl}?v=${Date.now()}`,
    updatedBy: session.username,
  })
})
