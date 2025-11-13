# Scripts de Build

## build.js

Script principal para compilar todos los slides de Marp a HTML estático.

### Uso

```bash
npm run build
```

### Qué hace

1. **Limpia** el directorio `dist/`
2. **Encuentra** todos los archivos `slides.md` en el proyecto
3. **Compila** cada slide a HTML usando `@marp-team/marp-cli`
4. **Copia** archivos HTML estáticos (index.html, viewer.html, etc.)
5. **Copia** imágenes y assets necesarios
6. **Genera** un índice de módulos compilados

### Salida

El script genera una carpeta `dist/` con:
- Todos los slides compilados a HTML (manteniendo la estructura de carpetas)
- Archivos HTML estáticos
- Imágenes y assets
- Archivo `MODULES.md` con índice de todos los módulos

### Desplegar

La carpeta `dist/` está lista para subir a cualquier servidor web estático:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Cualquier servidor web estático

