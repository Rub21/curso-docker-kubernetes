# 00 - Conceptos Básicos de Docker

## Objetivo
Comprender los conceptos fundamentales de Docker antes de empezar a trabajar con contenedores.

## ¿Qué aprenderás?
- ¿Qué es Docker y para qué sirve?
- Conceptos fundamentales: Imagen, Contenedor, Registry
- Ventajas y casos de uso
- Arquitectura básica de Docker

## ¿Qué es Docker?

Docker es una plataforma que permite **empaquetar** aplicaciones y sus dependencias en contenedores.

**Analogía:** Si una imagen es una clase, un contenedor es una instancia de esa clase.

### Características principales:
- **Contenedores**: Entornos aislados y portables
- **Imágenes**: Plantillas para crear contenedores
- **Docker Engine**: Motor que ejecuta los contenedores

## Conceptos Fundamentales

### Imagen
- **Definición**: Plantilla **read-only** para crear contenedores
- **Analogía**: Como un molde o plantilla
- **Características**: 
  - No cambia, es inmutable
  - Puede tener múltiples versiones (tags)
  - Se almacena en registries (Docker Hub)

### Contenedor
- **Definición**: Instancia **ejecutable** de una imagen
- **Analogía**: Como una copia ejecutándose
- **Características**:
  - Puede iniciarse, detenerse, eliminarse
  - Tiene su propio sistema de archivos
  - Aislado de otros contenedores

### Registry
- **Definición**: Repositorio de imágenes
- **Ejemplo más común**: Docker Hub
- **Uso**: Descargar y compartir imágenes

### Host
- **Definición**: Tu máquina física donde corre Docker
- **Ejemplo**: Tu computadora, servidor, o máquina virtual

## Ventajas de Docker

✅ **Aislamiento**: Cada contenedor es independiente  
✅ **Portabilidad**: Funciona igual en cualquier sistema  
✅ **Ligereza**: Más eficiente que máquinas virtuales  
✅ **Rapidez**: Inicio en segundos  
✅ **Consistencia**: Mismo entorno en desarrollo y producción  
✅ **Escalabilidad**: Fácil de escalar horizontalmente  

## Casos de Uso

### Desarrollo
- Entornos de desarrollo consistentes
- Evitar "funciona en mi máquina"
- Hot-reload y desarrollo local

### Producción
- Despliegues reproducibles
- Escalado automático
- Aislamiento de servicios

### CI/CD
- Entornos de prueba aislados
- Builds reproducibles
- Testing automatizado

## Arquitectura Básica

```
┌─────────────────────────────────────┐
│           Docker Host                │
│  ┌──────────────────────────────┐   │
│  │      Docker Engine            │   │
│  │  ┌──────────┐  ┌──────────┐  │   │
│  │  │Contenedor│  │Contenedor│  │   │
│  │  │    A     │  │    B     │  │   │
│  │  └──────────┘  └──────────┘  │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │  Imagen  │  │  Imagen  │        │
│  │  Python  │  │  Nginx   │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

## Flujo de Trabajo Básico

1. **Descargar** una imagen (`docker pull`)
2. **Crear** un contenedor (`docker run`)
3. **Ejecutar** la aplicación dentro del contenedor
4. **Detener** cuando termines (`docker stop`)
5. **Eliminar** si ya no lo necesitas (`docker rm`)

## Docker vs Máquinas Virtuales

| Característica | Docker | Máquinas Virtuales |
|----------------|--------|-------------------|
| **Tamaño** | MBs | GBs |
| **Inicio** | Segundos | Minutos |
| **Recursos** | Compartidos | Aislados |
| **OS** | Comparte kernel | OS completo |
| **Uso** | Aplicaciones | Sistemas completos |

## Componentes de Docker

### Docker Engine
- Motor que ejecuta contenedores
- Incluye: Docker daemon, API, CLI

### Docker CLI
- Herramienta de línea de comandos
- Comandos: `docker run`, `docker build`, etc.

### Docker Compose
- Orquestación de múltiples contenedores
- Archivo YAML para definir servicios

### Docker Hub
- Registry público de imágenes
- Similar a GitHub pero para imágenes

## Comandos Básicos (Referencia)

```bash
# Ver información
docker --version
docker info

# Trabajar con imágenes
docker images
docker pull <imagen>
docker rmi <imagen>

# Trabajar con contenedores
docker ps
docker run <imagen>
docker stop <contenedor>
docker rm <contenedor>
```

## Siguiente Paso

Ahora que entiendes los conceptos básicos, puedes empezar con el Módulo 01 para ejecutar tu primer contenedor.

**Módulo 01: Primer Contenedor Sencillo**

