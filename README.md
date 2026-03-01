# DEMO-CochiLoco
Demo landing page para la presentación de productos de brillo y protección para camiones: aluminio, cromo, vidrio y cera profesional. Incluye galería interactiva para carga de imágenes y videos como catálogo visual. Proyecto únicamente frontend para demostración comercial.

## Deploy en GitHub Pages

Este proyecto ya está configurado para export estático de Next.js y despliegue automático con GitHub Actions.

### 1) Configura Pages en GitHub

- Ve a Settings > Pages en tu repositorio.
- En Build and deployment, selecciona Source: GitHub Actions.

### 2) Sube cambios a la rama main

- Cada push a main ejecuta el workflow:
	- instala dependencias
	- compila el sitio estático
	- publica en GitHub Pages

### 3) Build local (opcional)

- npm install
- npm run build

La salida estática se genera en la carpeta out.
