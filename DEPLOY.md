# 🚀 Deployment a GitHub Pages

Este proyecto está configurado para desplegarse como sitio estático en GitHub Pages.

## ✅ Requisitos

- Cuenta en GitHub
- Repositorio creado en GitHub con el nombre `username.github.io` (para sitio personal)  
  O cualquier repositorio con Settings > Pages habilitado

## 📦 Build Actual

El build de producción ya está generado en la carpeta `out/` con:
- ✓ 59 archivos empaquetados
- ✓ 13 imágenes incluidas (logo, trucks, etc.)
- ✓ Código optimizado y minificado

## 🔧 Opción 1: Deploy Manual

1. **Subir al repositorio:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - El Cochi Loco landing page"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

2. **Configurar GitHub Pages:**
   - Ve a `Settings > Pages`
   - Select `Deploy from a branch`
   - Branch: `main` | Folder: `/root`
   - Save

3. **Espera 1-2 minutos** → Tu sitio estará en `https://TU_USUARIO.github.io`

## 🤖 Opción 2: Deploy Automático (Recomendado)

Se incluye un workflow de GitHub Actions que automáticamente:
- Compila el proyecto
- Genera el build
- Deploya a GitHub Pages

El workflow está en `.github/workflows/deploy.yml` y se ejecuta automáticamente al hacer push a `main`.

## 📝 Notas

- La configuración en `next.config.mjs` permite exportar como sitio estático
- Las imágenes están sin optimizar para máxima compatibilidad
- No requiere servidor backend
- Todo es contenido estático y rápido

## 🎨 Personalizar para tu Repo

Si tu repo no es `username.github.io`, actualiza en `next.config.mjs`:

```javascript
const basePath = process.env.BASE_PATH || '/nombre-repo'
```

Luego en GitHub:
- Settings > Pages
- Source: Deploy from a branch
- Branch: main, folder: /root

¡Listo! 🎉
