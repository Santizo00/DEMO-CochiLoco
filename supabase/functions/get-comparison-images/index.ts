/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2'

import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

type ComparisonSlot = 'before' | 'after'

type SlotFile = {
  path: string
  createdAt: string | null
}

function withCacheVersion(url: string, version: string | null) {
  if (!version) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${encodeURIComponent(version)}`
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    })
  }

  if (request.method !== 'GET') {
    return jsonResponse(
      { error: 'Metodo no permitido.' },
      {
        status: 405,
        headers: {
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const bucketName = Deno.env.get('IMAGES_BUCKET_NAME') || 'imagenes'

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      { error: 'Falta configurar SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const filesBySlot: Record<ComparisonSlot, SlotFile | null> = {
    before: null,
    after: null,
  }

  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(bucketName).list('comparador', {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      return jsonResponse({ error: 'No se pudieron cargar las imagenes del comparador.' }, { status: 500 })
    }

    const entries = data || []

    for (const entry of entries) {
      const name = (entry as { name?: string }).name || ''

      if (!name) {
        continue
      }

      const slot = name.startsWith('before-')
        ? 'before'
        : name.startsWith('after-')
          ? 'after'
          : null

      if (!slot) {
        continue
      }

      const createdAt = (entry as { created_at?: string | null }).created_at || null
      const current = filesBySlot[slot]

      if (!current) {
        filesBySlot[slot] = { path: `comparador/${name}`, createdAt }
        continue
      }

      const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : 0
      const nextTime = createdAt ? new Date(createdAt).getTime() : 0

      if (nextTime >= currentTime) {
        filesBySlot[slot] = { path: `comparador/${name}`, createdAt }
      }
    }

    if (entries.length < 100) {
      break
    }

    offset += 100
  }

  const beforeUrl = filesBySlot.before
    ? withCacheVersion(
        supabase.storage.from(bucketName).getPublicUrl(filesBySlot.before.path).data.publicUrl,
        filesBySlot.before.createdAt
      )
    : null

  const afterUrl = filesBySlot.after
    ? withCacheVersion(
        supabase.storage.from(bucketName).getPublicUrl(filesBySlot.after.path).data.publicUrl,
        filesBySlot.after.createdAt
      )
    : null

  return jsonResponse({ beforeUrl, afterUrl }, {
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
})
