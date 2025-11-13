# 07 - Docker Compose Avanzado

## Objetivo
Aprender configuraciones avanzadas de Docker Compose para aplicaciones complejas.

## ¿Qué aprenderás?
- Override files y entornos múltiples
- Healthchecks y dependencias
- Escalado de servicios
- Secrets y configs
- Profiles

## Ejercicio 1: Override Files

### docker compose.yml (base)
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mi_app
```

### docker compose.override.yml (desarrollo)
```yaml
services:
  web:
    volumes:
      - ./html:/usr/share/nginx/html
      - ./nginx-dev.conf:/etc/nginx/nginx.conf  # Override config
    environment:
      - DEBUG=true

  db:
    ports:
      - "5432:5432"  # Exponer puerto en desarrollo
    environment:
      POSTGRES_PASSWORD: dev_password
```

**Uso:**
```bash
# Docker Compose automáticamente usa override.yml
docker compose up

# O explícitamente
docker compose -f docker compose.yml -f docker compose.override.yml up
```

## Ejercicio 2: Healthchecks y Dependencias

### docker compose.yml con healthchecks
```yaml

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mi_app
      POSTGRES_PASSWORD: password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  web:
    build: ./app
    depends_on:
      db:
        condition: service_healthy  # Espera a que db esté healthy
    ports:
      - "5000:5000"

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
```

## Ejercicio 3: Escalado de Servicios

### docker compose.yml escalable
```yaml
services:
  web:
    build: ./app
    ports:
      - "5000-5002:5000"  # Múltiples puertos
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mi_app

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mi_app
      POSTGRES_PASSWORD: password

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web
```

### Escalar servicios
```bash
# Escalar web a 3 instancias
docker compose up -d --scale web=3

# Ver servicios escalados
docker compose ps
```

## Ejercicio 4: Secrets (Docker Swarm)

### Crear secrets
```bash
# Crear secret
echo "mi_password_secreto" | docker secret create db_password -

# Listar secrets
docker secret ls
```

### docker compose.yml con secrets
```yaml

services:
  db:
    image: postgres:15
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - source: db_password
        target: db_password

secrets:
  db_password:
    external: true
```

**Nota**: Secrets requieren Docker Swarm mode.

## Ejercicio 5: Configs

### Crear config
```bash
echo "server {
    listen 80;
    location / {
        proxy_pass http://web:5000;
    }
}" | docker config create nginx_config -
```

### Usar config en docker compose.yml
```yaml

services:
  nginx:
    image: nginx:alpine
    configs:
      - source: nginx_config
        target: /etc/nginx/nginx.conf

configs:
  nginx_config:
    external: true
```

## Ejercicio 6: Profiles

### docker compose.yml con profiles
```yaml

services:
  web:
    build: ./app
    ports:
      - "5000:5000"

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mi_app

  redis:
    image: redis:7-alpine
    profiles:
      - cache  # Solo se inicia con --profile cache

  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    profiles:
      - monitoring
```

### Usar profiles
```bash
# Iniciar solo servicios base
docker compose up -d

# Iniciar con redis (profile cache)
docker compose --profile cache up -d

# Iniciar con monitoring
docker compose --profile monitoring up -d

# Iniciar con múltiples profiles
docker compose --profile cache --profile monitoring up -d
```

## Ejercicio 7: Entornos Múltiples

### Estructura
```
07-docker compose-avanzado/
├── docker compose.yml
├── docker compose.dev.yml
├── docker compose.prod.yml
└── docker compose.test.yml
```

### docker compose.prod.yml
```yaml

services:
  web:
    image: mi-app:latest  # Imagen pre-construida
    restart: always
    environment:
      - FLASK_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  db:
    restart: always
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

### docker compose.test.yml
```yaml

services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: test_db
      POSTGRES_PASSWORD: test_password
    tmpfs:
      - /var/lib/postgresql/data  # En memoria para tests rápidos

  test:
    build: ./app
    command: pytest
    depends_on:
      - test-db
    environment:
      - DATABASE_URL=postgresql://postgres:test_password@test-db:5432/test_db
```

## Ejercicio 8: Resource Limits

### docker compose.yml con límites
```yaml

services:
  web:
    build: ./app
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    restart: unless-stopped

  db:
    image: postgres:15
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '1.0'
          memory: 512M
```

## Comandos avanzados

```bash
# Validar configuración
docker compose config

# Ver variables de entorno resueltas
docker compose config --resolve-env-vars

# Pausar servicios
docker compose pause

# Reanudar servicios
docker compose unpause

# Recrear servicios
docker compose up -d --force-recreate

# Actualizar servicios
docker compose up -d --no-deps web
```

## Mejores prácticas
1. ✅ Usa override files para diferentes entornos
2. ✅ Define healthchecks para servicios críticos
3. ✅ Usa profiles para servicios opcionales
4. ✅ Establece límites de recursos
5. ✅ Separa configuraciones por entorno

## Siguiente paso
Aprende a optimizar imágenes Docker para producción.

