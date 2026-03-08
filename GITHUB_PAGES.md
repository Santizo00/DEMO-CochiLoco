# 📦 El Cochi Loco - Landing Page

Landing page profesional para **El Cochi Loco** con paleta de colores rojo/negro/verde neón del logo.

## 🚀 Inicio Rápido

### 1. Clonar y preparar
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd DEMO-CochiLoco
npm install
```

### 2. Desarrollo local
```bash
npm run dev
# Abre http://localhost:3000
```

### 3. Desplegar a GitHub Pages

**Opción A: Automático con GitHub Actions**
- Simplemente haz `git push` a `main`
- El workflow en `.github/workflows/deploy.yml` se ejecutará automáticamente
- Tu sitio estará disponible en `https://TU_USUARIO.github.io`

**Opción B: Manual**
```bash
npm run build
# Sube la carpeta `out/` a GitHub Pages manualmente
```

## 📋 Características

✅ Paleta visual alineada al logo (rojo/negro/verde neón)  
✅ Logo prominente en navbar y hero  
✅ Secciones: Inicio, Producto, Galería, Antes/Después, Testimonios, Contacto  
✅ Contactos directos de Melvin Ozorio y Hugo Robledo con WhatsApp  
✅ Responsive (mobile, tablet, desktop)  
✅ Optimizado para performance  
✅ Listo para producción  

## 📁 Estructura

```
project/
├── app/               # Next.js app router
├── components/        # Componentes React
│   ├── navbar.tsx
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   ├── gallery-section.tsx
│   ├── before-after-section.tsx
│   ├── testimonials-section.tsx
│   ├── contact-section.tsx
│   └── footer.tsx
├── public/            # Archivos estáticos (imágenes, logo)
│   ├── logo.jpeg
│   └── images/
├── out/               # Build de producción (GitHub Pages)
└── .github/workflows/ # GitHub Actions
```

## 🎨 Paleta de Colores

- **Primario (Rojo):** `oklch(0.63 0.246 27)` - CTA y acentos principales
- **Acento (Verde Neón):** `oklch(0.85 0.26 138)` - Títulos y highlights
- **Fondo (Negro Grafito):** `oklch(0.13 0.01 260)`
- **Texto (Blanco):** `oklch(0.97 0.004 90)`

## 📲 Contactos

- **Melvin Ozorio:** (502) 3672-9387
- **Hugo Robledo:** (502) 4343-4097

## 🔧 Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide Icons
- shadcn/ui

## 📝 Licencia

© 2026 El Cochi Loco. Todos los derechos reservados.

---

**¿Necesitas ayuda?** Consulta [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas de deployment.
