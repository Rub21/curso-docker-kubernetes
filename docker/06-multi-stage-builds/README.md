# 06 - Multi-Stage Builds

## Objetivo
Aprender a usar multi-stage builds para crear imágenes Docker más pequeñas y optimizadas.

## ¿Qué aprenderás?
- Cómo usar múltiples etapas en un Dockerfile
- Reducir el tamaño de las imágenes finales
- Separar dependencias de build de las de runtime

## ¿Por qué Multi-Stage Builds?
- **Imágenes más pequeñas**: Solo incluyes lo necesario en la imagen final
- **Seguridad**: No incluyes herramientas de build en producción
- **Optimización**: Diferentes etapas para diferentes propósitos

## Ejercicio 1: Aplicación Node.js

### Dockerfile tradicional (problema)
```dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

**Problema**: La imagen incluye:
- Node.js completo
- npm y todas las dependencias de desarrollo
- Código fuente
- Herramientas de build

**Tamaño**: ~900MB

### Dockerfile con Multi-Stage (solución)
```dockerfile
# Etapa 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "dist/index.js"]
```

**Ventajas**:
- Solo incluye lo necesario en la etapa final
- Usa `alpine` (imagen más pequeña)
- No incluye código fuente ni herramientas de build

**Tamaño**: ~150MB

## Ejercicio 2: Aplicación Python

### Dockerfile multi-stage para Python
```dockerfile
# Etapa 1: Build
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Etapa 2: Runtime
FROM python:3.9-slim
WORKDIR /app
# Copiar solo las dependencias instaladas
COPY --from=builder /root/.local /root/.local
COPY app.py .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

## Ejercicio 3: Aplicación Go

### Dockerfile para Go (ejemplo perfecto)
```dockerfile
# Etapa 1: Compilar
FROM golang:1.21 AS builder
WORKDIR /app
COPY go.mod go.sum .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server

# Etapa 2: Runtime mínimo
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]
```

**Resultado**: Imagen de solo ~10-20MB (vs ~800MB con golang:1.21)

## Ejercicio 4: Aplicación con compilación compleja

### Dockerfile para aplicación con dependencias nativas
```dockerfile
# Etapa 1: Build con todas las herramientas
FROM python:3.9 AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Etapa 2: Runtime sin herramientas de compilación
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app.py .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

## Ejercicio 5: Múltiples etapas de build

### Dockerfile con varias etapas intermedias
```dockerfile
# Etapa 1: Dependencias
FROM node:18 AS deps
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci

# Etapa 2: Build
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa 3: Test (opcional)
FROM builder AS test
RUN npm test

# Etapa 4: Producción
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "dist/index.js"]
```

## Ejercicio 6: Docker Compose con múltiples Dockerfiles

### docker-compose.yml
```yaml
services:
  # Multi-stage Node.js (optimizado)
  app-optimizado:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    container_name: multi-stage-node-optimizado

  # Dockerfile tradicional Node.js (no optimizado)
  app-tradicional:
    build:
      context: .
      dockerfile: Dockerfile.tradicional
    ports:
      - "3001:3000"
    container_name: multi-stage-node-tradicional

  # Multi-stage Python
  app-python:
    build:
      context: .
      dockerfile: Dockerfile.python
    ports:
      - "5000:5000"
    container_name: multi-stage-python

  # Multi-stage Go
  app-go:
    build:
      context: .
      dockerfile: Dockerfile.go
    ports:
      - "8080:8080"
    container_name: multi-stage-go
```

### Usar Docker Compose
```bash
# Construir todos los servicios
docker compose build

# Iniciar todos los servicios
docker compose up -d

# Ver estado de los servicios
docker compose ps

# Ver logs de un servicio específico
docker compose logs app-optimizado

# Comparar tamaños de imágenes
docker images | grep multi-stage

# Detener todos los servicios
docker compose down
```

## Comandos útiles

### Construir etapa específica
```bash
# Construir solo la etapa "builder"
docker build --target builder -t mi-app:builder .

# Construir etapa de producción
docker build --target production -t mi-app:prod .
```

### Ver tamaño de imágenes
```bash
# Comparar tamaños
docker images | grep mi-app

# Inspeccionar capas
docker history mi-app:prod

# Comparar tamaños con docker compose
docker compose images
```

## Mejores prácticas
1. ✅ Usa imágenes base pequeñas en la etapa final (alpine, slim)
2. ✅ Copia solo archivos necesarios con `--from`
3. ✅ Nombra las etapas con `AS` para claridad
4. ✅ Separa dependencias de desarrollo de producción
5. ✅ Usa `.dockerignore` para excluir archivos innecesarios

## Comparación de tamaños

| Enfoque | Tamaño |
|---------|--------|
| Single-stage (node:18) | ~900MB |
| Multi-stage (node:18-alpine) | ~150MB |
| Multi-stage optimizado | ~50MB |

## Siguiente paso
Aprende Docker Compose avanzado con múltiples servicios y configuraciones complejas.

