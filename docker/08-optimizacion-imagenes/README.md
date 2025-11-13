# 08 - Optimización de Imágenes Docker

## Objetivo
Aprender técnicas avanzadas para optimizar el tamaño y rendimiento de las imágenes Docker.

## ¿Qué aprenderás?
- Reducir el tamaño de imágenes
- Mejorar tiempos de build
- Optimizar capas y caché
- Usar .dockerignore eficientemente

## Estrategias de optimización

### 1. Usar imágenes base pequeñas

#### ❌ Mal
```dockerfile
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3
```

#### ✅ Bien
```dockerfile
FROM python:3.9-alpine
# Alpine es ~5MB vs Ubuntu ~70MB
```

### 2. Combinar comandos RUN

#### ❌ Mal (múltiples capas)
```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get clean
```

#### ✅ Bien (una sola capa)
```dockerfile
RUN apt-get update && \
    apt-get install -y curl git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

## Ejercicio 1: .dockerignore

### Crear .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode
*.md
.DS_Store
```

**Beneficios:**
- Builds más rápidos
- Imágenes más pequeñas
- No incluir archivos sensibles

## Ejercicio 2: Orden de capas

### ❌ Orden incorrecto
```dockerfile
FROM node:18
WORKDIR /app
COPY . .              # Cambia frecuentemente
RUN npm install       # Dependencias cambian menos
```

**Problema**: Cada cambio en código invalida la caché de `npm install`

### ✅ Orden correcto
```dockerfile
FROM node:18
WORKDIR /app
COPY package.json package-lock.json .  # Cambia menos
RUN npm ci                              # Se cachea mejor
COPY . .                                # Cambia frecuentemente
```

## Ejercicio 3: Multi-stage optimizado

### Dockerfile optimizado
```dockerfile
# Etapa 1: Dependencias (caché separado)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci --only=production && \
    npm cache clean --force

# Etapa 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

# Etapa 3: Producción mínima
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --chown=nextjs:nodejs package.json .
USER nextjs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Ejercicio 4: Limpiar en la misma capa

### ❌ Mal
```dockerfile
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*
```

### ✅ Bien
```dockerfile
RUN apt-get update && \
    apt-get install -y build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

## Ejercicio 5: Usar distroless

### Imágenes distroless (Google)
```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o server

# Runtime stage (distroless)
FROM gcr.io/distroless/base-debian11
COPY --from=builder /app/server /server
CMD ["/server"]
```

**Ventajas:**
- Solo binario, sin shell ni herramientas
- Muy pequeña y segura
- ~20MB vs ~100MB+ con alpine

## Ejercicio 6: Optimizar Python

### Dockerfile Python optimizado
```dockerfile
FROM python:3.9-slim AS builder

# Instalar dependencias del sistema necesarias
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime
FROM python:3.9-slim
WORKDIR /app

# Copiar solo dependencias
COPY --from=builder /root/.local /root/.local

# Copiar aplicación
COPY app.py .

# Usar usuario no-root
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

## Ejercicio 7: BuildKit y cache mounts

### Habilitar BuildKit
```bash
export DOCKER_BUILDKIT=1
# O en docker compose
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker compose build
```

### Dockerfile con cache mounts
```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:18-alpine

WORKDIR /app

# Cache mount para node_modules
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY package.json .
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build
```

## Ejercicio 8: Docker Compose para Comparar Optimizaciones

### docker-compose.yml
```yaml
services:
  # Versión NO optimizada (para comparación)
  app-no-optimizado:
    build:
      context: .
      dockerfile: Dockerfile.no-optimizado
    ports:
      - "5001:5000"
    container_name: optimizacion-no-optimizado

  # Versión optimizada con multi-stage y mejores prácticas
  app-optimizado:
    build:
      context: .
      dockerfile: Dockerfile.optimizado
    ports:
      - "5000:5000"
    container_name: optimizacion-optimizado
```

### Usar Docker Compose
```bash
# Construir ambas versiones
docker compose build

# Iniciar ambas aplicaciones
docker compose up -d

# Comparar tamaños de imágenes
docker images | grep optimizacion

# Ver diferencias de tamaño
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep optimizacion

# Ver logs de ambas
docker compose logs -f

# Detener todas
docker compose down
```

**Ventaja:** Puedes comparar fácilmente el tamaño y rendimiento de ambas versiones

## Ejercicio 9: Analizar imágenes

### Ver tamaño de capas
```bash
# Ver historial y tamaños
docker history mi-imagen

# Ver tamaño de cada capa
docker history --human --format "{{.CreatedBy}}: {{.Size}}" mi-imagen

# Analizar con dive (herramienta externa)
dive mi-imagen
```

### Comparar imágenes
```bash
# Ver todas las imágenes
docker images

# Limpiar imágenes no usadas
docker image prune

# Ver espacio usado
docker system df
```

## Ejercicio 9: Tags específicos

### ❌ Evitar latest
```dockerfile
FROM node:latest  # Puede cambiar inesperadamente
```

### ✅ Usar versiones específicas
```dockerfile
FROM node:18.17.0-alpine  # Versión específica
```

## Checklist de optimización

- [ ] Usar imágenes base pequeñas (alpine, slim)
- [ ] Combinar comandos RUN
- [ ] Ordenar capas de menos a más cambios
- [ ] Usar .dockerignore
- [ ] Multi-stage builds
- [ ] Limpiar en la misma capa
- [ ] Usar cache mounts (BuildKit)
- [ ] Eliminar dependencias de desarrollo
- [ ] Usar tags específicos
- [ ] Usar usuario no-root

## Comparación de tamaños

| Estrategia | Tamaño |
|-----------|--------|
| Sin optimizar | ~900MB |
| Alpine base | ~300MB |
| Multi-stage | ~150MB |
| Multi-stage + optimizado | ~50MB |
| Distroless | ~20MB |

## Herramientas útiles

```bash
# Dive - analizar imágenes
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive mi-imagen

# Docker Slim - reducir imágenes
docker-slim build mi-imagen
```

## Siguiente paso
Aprende sobre healthchecks y logging para aplicaciones en producción.

