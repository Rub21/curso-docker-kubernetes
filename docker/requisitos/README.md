# Requisitos del Curso de Docker

## Prerrequisitos

Antes de comenzar el curso, asegúrate de tener lo siguiente:

### 1. Cuenta de GitHub

Necesitas una cuenta de GitHub para acceder a GitHub Codespaces.

- Si no tienes cuenta: [Crear cuenta en GitHub](https://github.com/signup)
- Si ya tienes cuenta: [Iniciar sesión](https://github.com/login)

### 2. GitHub Codespaces

GitHub Codespaces proporciona un entorno de desarrollo completo en la nube, sin necesidad de instalar Docker localmente.

**Cómo iniciar un Codespace:**

1. Ve a: [https://github.com/codespaces](https://github.com/codespaces)
2. O desde el repositorio del curso, haz clic en el botón **"Code"** → **"Codespaces"** → **"Create codespace on main"**
3. Espera a que se inicialice el entorno (puede tomar 1-2 minutos)

**Ventajas de usar Codespaces:**
- ✅ No necesitas instalar Docker en tu máquina
- ✅ Entorno preconfigurado y listo para usar
- ✅ Accesible desde cualquier navegador
- ✅ Incluye todas las herramientas necesarias

### 3. Extensiones de VS Code (Recomendadas)

Una vez que tengas el Codespace abierto, instala estas extensiones para mejorar tu experiencia:

#### Better YAML Formatter
- **ID**: `redhat.vscode-yaml`
- **Descripción**: Formatea archivos YAML automáticamente
- **Instalación**: Busca "Better YAML" en el marketplace de extensiones

#### YAML Syntax Highlighting
- **ID**: `redhat.vscode-yaml` (incluido en Better YAML)
- **Descripción**: Resaltado de sintaxis para archivos YAML

#### Material Icon Theme
- **ID**: `PKief.material-icon-theme`
- **Descripción**: Iconos modernos para el explorador de archivos
- **Instalación**: Busca "Material Icon Theme" en el marketplace

**Cómo instalar extensiones:**
1. Presiona `Ctrl+Shift+X` (o `Cmd+Shift+X` en Mac) para abrir el panel de extensiones
2. Busca el nombre de la extensión
3. Haz clic en **"Install"**

### 4. Comandos Útiles

#### Recargar Ventana
Si necesitas recargar la ventana del editor:
- Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
- Escribe: `reload window`
- Selecciona: **"Developer: Reload Window"**

### 5. Verificar Instalación

Una vez que tengas todo configurado, verifica que Docker esté funcionando:

```bash
# Verificar versión de Docker
docker --version

# Verificar Docker Compose
docker compose version

# Verificar que Docker esté corriendo
docker ps
```

Si todos los comandos funcionan correctamente, ¡estás listo para comenzar el curso!

## Estructura del Curso

El curso está organizado en módulos numerados:

- `00-conceptos-basicos/` - Conceptos fundamentales de Docker
- `01-primer-contenedor/` - Tu primer contenedor
- `02-dockerfile-basico/` - Crear imágenes con Dockerfile
- `03-volumenes/` - Gestión de volúmenes
- `04-redes/` - Redes en Docker
- `05-docker-compose-basico/` - Orquestación básica
- `06-multi-stage-builds/` - Optimización de builds
- `07-docker-compose-avanzado/` - Configuraciones avanzadas
- `08-optimizacion-imagenes/` - Optimización de imágenes
- `09-healthchecks-logging/` - Monitoreo y logs
- `10-produccion-mejores-practicas/` - Producción y seguridad

## Siguiente Paso

Una vez completados los requisitos, puedes comenzar con:

👉 **[Módulo 00: Conceptos Básicos](../00-conceptos-basicos/README.md)**

## Solución de Problemas

### No puedo acceder a GitHub Codespaces
- Verifica que tu cuenta de GitHub esté activa
- Asegúrate de tener acceso a internet
- Intenta usar un navegador diferente

### Docker no funciona en Codespaces
- Recarga la ventana (`Ctrl+Shift+P` → "Reload Window")
- Verifica que el Codespace esté completamente inicializado
- Contacta al instructor si el problema persiste

### Las extensiones no se instalan
- Verifica que estés en el Codespace (no en VS Code local)
- Intenta recargar la ventana después de instalar
- Revisa que tengas permisos para instalar extensiones

## Recursos Adicionales

- [Documentación de GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

