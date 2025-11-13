---
marp: true
theme: default
paginate: true
header: 'Requisitos del Curso'
footer: 'Curso de Docker'
style: |
  section {
    font-size: 22px;
  }
  code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
  }
  pre {
    font-size: 16px;
  }
  /* Ajustar tamaño de iconos emoji */
  section :is(h1, h2, h3, p, li) {
    font-size: inherit;
  }
---

# Requisitos del Curso de Docker

**De Básico a Avanzado por Ruben Lopez Mendoza**

**Configuración inicial necesaria**

---

## Objetivo

Asegurarnos de que todos tengan el entorno correcto configurado antes de comenzar el curso.

**¿Por qué es importante?**
- ✅ Evitar problemas durante el curso
- ✅ Todos trabajamos en el mismo entorno
- ✅ No necesitas instalar nada en tu máquina

---

## Prerrequisitos

Antes de comenzar, necesitas:

1. **Cuenta de GitHub**
2. **GitHub Codespaces** (entorno en la nube)
3. **Extensiones de VS Code** (recomendadas)
4. **Verificar instalación**

---

## 1. Cuenta de GitHub

Necesitas una cuenta de GitHub para acceder a GitHub Codespaces.

**Si no tienes cuenta:**
- [Crear cuenta en GitHub](https://github.com/signup)
- Es gratis y toma solo unos minutos

**Si ya tienes cuenta:**
- [Iniciar sesión](https://github.com/login)
- Verifica que puedas acceder

---

## 2. GitHub Codespaces

**¿Qué es?**
Entorno de desarrollo completo en la nube.

**Ventajas:**
- ✅ No necesitas instalar Docker localmente
- ✅ Entorno preconfigurado y listo
- ✅ Accesible desde cualquier navegador
- ✅ Incluye todas las herramientas necesarias

---

## Cómo Iniciar un Codespace

**Opción 1: Desde GitHub**
1. Ve a: [https://github.com/codespaces](https://github.com/codespaces)
2. Haz clic en **"New codespace"**
3. Selecciona el repositorio del curso

**Opción 2: Desde el repositorio**
1. Abre el repositorio del curso
2. Haz clic en **"Code"** → **"Codespaces"**
3. Selecciona **"Create codespace on main"**

---

## Inicialización del Codespace

**Tiempo estimado:** 1-2 minutos

**Qué sucede:**
- Se crea un contenedor con VS Code
- Se instalan herramientas necesarias
- Se clona el repositorio del curso
- Docker ya está preinstalado

**Espera hasta que veas el editor abierto**

---

## 3. Extensiones de VS Code

Una vez que tengas el Codespace abierto, instala estas extensiones:

**YAML **
- ID: `redhat.vscode-yaml`
- Formatea archivos YAML automáticamente

**Material Icon Theme**
- ID: `PKief.material-icon-theme`
- Iconos modernos para el explorador

---

## Cómo Instalar Extensiones

**Pasos:**
1. Presiona `Ctrl+Shift+X` (o `Cmd+Shift+X` en Mac)
2. Busca el nombre de la extensión
3. Haz clic en **"Install"**

**Nota:** Las extensiones se instalan solo en el Codespace actual

---

## 4. Comandos Útiles

### Recargar Ventana
Si necesitas recargar el editor:
- Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
- Escribe: `reload window`
- Selecciona: **"Developer: Reload Window"**

**Útil cuando:**
- Las extensiones no funcionan
- Cambios no se reflejan
- Problemas de rendimiento

---

## 5. Verificar Instalación

Verifica que Docker esté funcionando:

```bash
# Verificar versión de Docker
docker --version
```

```bash
# Verificar Docker Compose
docker compose version
```

```bash
# Verificar que Docker esté corriendo
docker ps
```

---

## Verificación Completa

**Todos estos comandos deben funcionar:**

```bash
docker --version
docker compose version
docker ps
```

**Si todos funcionan:** ✅ Estás listo para comenzar

**Si hay errores:** Revisa la sección de solución de problemas

---

## Estructura del Curso

El curso está organizado en módulos:

- `00-conceptos-basicos/` - Fundamentos
- `01-primer-contenedor/` - Primer contenedor
- `02-dockerfile-basico/` - Dockerfiles
- `03-volumenes/` - Volúmenes
- `04-redes/` - Redes
- `05-docker-compose-basico/` - Compose básico
- `06-multi-stage-builds/` - Optimización
- `07-docker-compose-avanzado/` - Compose avanzado
- `08-optimizacion-imagenes/` - Optimización
- `09-healthchecks-logging/` - Monitoreo
- `10-produccion-mejores-practicas/` - Producción

---

## Solución de Problemas

### No puedo acceder a GitHub Codespaces
- Verifica que tu cuenta esté activa
- Asegúrate de tener acceso a internet
- Intenta usar un navegador diferente

### Docker no funciona
- Recarga la ventana (`Ctrl+Shift+P` → "Reload Window")
- Verifica que el Codespace esté inicializado
- Contacta al instructor si persiste

---

## Solución de Problemas (Cont.)

### Las extensiones no se instalan
- Verifica que estés en el Codespace
- Intenta recargar la ventana
- Revisa permisos de instalación

### El Codespace es lento
- Cierra otros Codespaces activos
- Reinicia el Codespace
- Verifica tu conexión a internet

---

## Recursos Adicionales

**Documentación oficial:**
- [GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Checklist de Verificación

Antes de continuar, verifica:

- [ ] Tengo cuenta de GitHub
- [ ] Codespace está abierto y funcionando
- [ ] Extensiones instaladas (opcional)
- [ ] `docker --version` funciona
- [ ] `docker compose version` funciona
- [ ] `docker ps` funciona

---

## Siguiente Paso

Una vez completados los requisitos:

👉 **Módulo 00: Conceptos Básicos**

**¿Listo para comenzar?** 🚀

---

## Preguntas?

¿Alguien tiene problemas con la configuración?

**Tiempo para resolver dudas antes de comenzar**

---

## ¡Bienvenido al Curso!

**Estás listo para aprender Docker** 🐳

**¡Comencemos!**

