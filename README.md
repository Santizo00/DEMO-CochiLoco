# DEMO-CochiLoco

Landing page de CochiLoco para productos de limpieza y pulido automotriz, construida con Next.js y export estático para GitHub Pages.

## Funcionalidades

- Secciones completas: Inicio, Producto, Galería, Antes/Después, Testimonios y Contacto.
- Login de administrador desde el navbar.
- Galería pública alimentada desde Supabase Storage.
- Carga y eliminación de imágenes restringida a administrador por medio de Edge Functions.
- Comparador Antes/Después con imágenes dinámicas:
  - Lectura pública desde Supabase.
  - Actualización por slot (`before` y `after`) solo para admin.
  - Al subir una nueva imagen, se reemplaza automáticamente la anterior del mismo slot.

## Stack

- Next.js 16 (App Router, static export)
- TypeScript + Tailwind CSS
- Supabase (Storage, tabla `imagenes`, Edge Functions)

## Variables de entorno

Usa `.env.local` (basado en `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Desarrollo local

```bash
npm install
npm run lint
npm run build
npm start
```

## Supabase Functions usadas

- `admin-login`
- `admin-upload-image`
- `admin-delete-image`
- `admin-upsert-comparison-image`
- `get-comparison-images`

## Deploy

Cada `push` a `main` dispara el workflow de GitHub Actions y publica automáticamente en GitHub Pages.

