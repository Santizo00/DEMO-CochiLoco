import { createClient } from 'jsr:@supabase/supabase-js@2'

import { verifyAdminSessionToken } from '../_shared/admin-session.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

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

  const body = await request.json().catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''
  const imageId = typeof body?.imageId === 'string' ? body.imageId.trim() : ''

  if (!token) {
    return jsonResponse({ error: 'Sesion de administrador no enviada.' }, { status: 401 })
  }

  const session = await verifyAdminSessionToken(token, sessionSecret)

  if (!session) {
    return jsonResponse({ error: 'Sesion invalida o vencida.' }, { status: 401 })
  }

  if (!imageId) {
    return jsonResponse({ error: 'Debes indicar la imagen que deseas eliminar.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: imageRow, error: readError } = await supabase
    .from('imagenes')
    .select('id, ruta, usuario_id')
    .eq('id', imageId)
    .maybeSingle()

  if (readError) {
    return jsonResponse({ error: 'No se pudo localizar la imagen solicitada.' }, { status: 500 })
  }

  if (!imageRow) {
    return jsonResponse({ error: 'La imagen ya no existe en la galeria.' }, { status: 404 })
  }

  if (imageRow.usuario_id !== session.sub) {
    return jsonResponse({ error: 'No tienes permisos para eliminar esta imagen.' }, { status: 403 })
  }

  const { error: storageError } = await supabase.storage.from(bucketName).remove([imageRow.ruta])

  if (storageError) {
    return jsonResponse({ error: 'No se pudo eliminar el archivo del bucket.' }, { status: 500 })
  }

  const { error: deleteError } = await supabase.from('imagenes').delete().eq('id', imageId)

  if (deleteError) {
    return jsonResponse({ error: 'No se pudo eliminar el registro de la imagen.' }, { status: 500 })
  }

  return jsonResponse({ success: true })
})