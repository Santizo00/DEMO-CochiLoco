import { createClient } from 'jsr:@supabase/supabase-js@2'

import { createAdminSessionToken } from '../_shared/admin-session.ts'
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

  if (!supabaseUrl || !serviceRoleKey || !sessionSecret) {
    return jsonResponse(
      { error: 'Falta configurar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o ADMIN_SESSION_SECRET.' },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const usuario = typeof body?.usuario === 'string' ? body.usuario.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!usuario || !password) {
    return jsonResponse({ error: 'Debes enviar usuario y contrasena.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, usuario')
    .eq('usuario', usuario)
    .eq('password', password)
    .maybeSingle()

  if (error) {
    return jsonResponse({ error: 'No se pudo validar el usuario administrador.' }, { status: 500 })
  }

  if (!data) {
    return jsonResponse({ error: 'Usuario o contrasena incorrectos.' }, { status: 401 })
  }

  const session = await createAdminSessionToken(
    { userId: data.id, username: data.usuario },
    sessionSecret
  )

  return jsonResponse({
    ...session,
    userId: data.id,
    username: data.usuario,
  })
})
