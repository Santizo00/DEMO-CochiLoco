# Supabase Setup

Este proyecto usa tres piezas en Supabase:

- Tabla privada `usuarios` para validar el acceso del admin.
- Tabla publica `imagenes` para mostrar la galeria.
- Bucket publico `imagenes` para servir los archivos publicados.

## 1. Ejecuta el SQL

Corre el contenido de `supabase/setup.sql` en el SQL Editor de Supabase.

## 2. Configura secretos para Edge Functions

```bash
supabase secrets set ADMIN_SESSION_SECRET="cambia-esto-por-un-secreto-largo"
supabase secrets set MAX_BUCKET_BYTES="52428800"
```

`MAX_BUCKET_BYTES` esta en bytes. `52428800` equivale a `50 MB`.

## 3. Despliega las funciones

```bash
supabase functions deploy admin-login --no-verify-jwt
supabase functions deploy admin-upload-image --no-verify-jwt
supabase functions deploy admin-delete-image --no-verify-jwt
```

## 4. Crea el unico usuario administrador

Inserta un registro manual en `usuarios` con el usuario y contrasena que usaras en el navbar.

## 5. Variables del frontend

Si quieres sobreescribir los valores por defecto del proyecto, copia `.env.example` a `.env.local` y ajusta:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Notas

- La lectura de la galeria es publica.
- La carga y eliminacion pasan por Edge Functions para no exponer acceso directo a la tabla `usuarios` ni abrir escritura publica al bucket.
- El frontend comprime las imagenes antes de subirlas y la funcion vuelve a comprobar el espacio disponible antes de publicarlas.
