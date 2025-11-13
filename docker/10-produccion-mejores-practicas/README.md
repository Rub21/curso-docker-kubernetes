# 10 - Producción y Mejores Prácticas

## Objetivo
Aprender las mejores prácticas para ejecutar Docker en producción de forma segura y eficiente.

## ¿Qué aprenderás?
- Seguridad en contenedores
- Gestión de secrets
- Estrategias de despliegue
- Monitoreo y observabilidad
- Backup y recuperación

## Seguridad

## Ejercicio 1: Usuario no-root

### Dockerfile seguro
```dockerfile
FROM python:3.9-slim

# Crear usuario no-root
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Instalar dependencias como root
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos
COPY app.py .

# Cambiar ownership
RUN chown -R appuser:appuser /app

# Cambiar a usuario no-root
USER appuser

EXPOSE 5000
CMD ["python", "app.py"]
```

## Ejercicio 2: Escanear imágenes

### Usar Docker Scout o Trivy
```bash
# Docker Scout (nativo)
docker scout quickview mi-imagen

# Trivy
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image mi-imagen
```

## Ejercicio 3: Secrets en producción

### Usar Docker Secrets (Swarm) o variables de entorno
```yaml
# docker compose.yml

services:
  app:
    image: mi-app:latest
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    # Nunca usar:
    # - DATABASE_PASSWORD=password123  # ❌

secrets:
  db_password:
    external: true
```

### O usar archivos .env (nunca commitear)
```bash
# .env (NO commitear a git)
DATABASE_PASSWORD=mi_password_seguro
API_KEY=mi_api_key
```

## Gestión de Configuración

## Ejercicio 4: Variables de entorno

### docker compose.prod.yml
```yaml

services:
  app:
    image: mi-app:${VERSION:-latest}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file:
      - .env.production  # Cargar desde archivo
    restart: always
```

## Ejercicio 5: Resource Limits

### Limitar recursos
```yaml

services:
  app:
    image: mi-app:latest
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '1.0'
          memory: 512M
    restart: always
    restart_policy:
      condition: on-failure
      max_attempts: 3
      window: 120s
```

## Estrategias de Despliegue

## Ejercicio 6: Blue-Green Deployment

### Script de deployment
```bash
#!/bin/bash
# deploy.sh

NEW_VERSION="v2.0"
OLD_VERSION="v1.0"

# Construir nueva versión
docker build -t mi-app:$NEW_VERSION .

# Iniciar nueva versión (green)
docker run -d --name app-green -p 8081:5000 mi-app:$NEW_VERSION

# Healthcheck
sleep 10
if curl -f http://localhost:8081/health; then
    # Cambiar tráfico a green
    docker stop app-blue
    docker rm app-blue
    docker rename app-green app-blue
    echo "Deployment exitoso"
else
    # Rollback
    docker stop app-green
    docker rm app-green
    echo "Deployment fallido, rollback"
fi
```

## Ejercicio 7: Rolling Updates

### Docker Swarm rolling update
```bash
# Actualizar servicio con rolling update
docker service update \
  --image mi-app:v2.0 \
  --update-parallelism 2 \
  --update-delay 10s \
  mi-app-service
```

## Monitoreo

## Ejercicio 8: Healthchecks en producción

### docker compose.prod.yml
```yaml

services:
  app:
    image: mi-app:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: always
```

## Ejercicio 9: Métricas y observabilidad

### Agregar Prometheus
```yaml

services:
  app:
    image: mi-app:latest
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=5000"
      - "prometheus.path=/metrics"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## Backup y Recuperación

## Ejercicio 10: Backup de volúmenes

### Script de backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de volumen de PostgreSQL
docker run --rm \
  -v postgres-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/postgres-$DATE.tar.gz -C /data .

# Backup de volumen de aplicación
docker run --rm \
  -v app-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/app-$DATE.tar.gz -C /data .

echo "Backup completado: $BACKUP_DIR"
```

### Restaurar backup
```bash
# Restaurar PostgreSQL
docker run --rm \
  -v postgres-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine sh -c "cd /data && tar xzf /backup/postgres-20240101_120000.tar.gz"
```

## Checklist de Producción

### Seguridad
- [ ] Usar usuario no-root
- [ ] Escanear imágenes por vulnerabilidades
- [ ] No hardcodear secrets
- [ ] Usar imágenes oficiales y actualizadas
- [ ] Limitar recursos (CPU, memoria)
- [ ] Usar redes aisladas

### Configuración
- [ ] Variables de entorno para configuración
- [ ] Healthchecks implementados
- [ ] Logging configurado y rotado
- [ ] Restart policies configuradas
- [ ] Tags de versión específicos (no latest)

### Operaciones
- [ ] Estrategia de backup definida
- [ ] Plan de recuperación documentado
- [ ] Monitoreo y alertas configurados
- [ ] Documentación actualizada
- [ ] Proceso de despliegue automatizado

## Ejercicio 11: Dockerfile de producción completo

### Dockerfile.prod
```dockerfile
# Build stage
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim

# Crear usuario no-root
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1000 appuser

WORKDIR /app

# Copiar dependencias
COPY --from=builder /root/.local /root/.local

# Copiar aplicación
COPY --chown=appuser:appuser app.py .

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')"

# Cambiar a usuario no-root
USER appuser

ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000

CMD ["python", "app.py"]
```

## Ejercicio 12: docker compose.prod.yml completo

```yaml

services:
  app:
    image: mi-app:${VERSION}
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network

  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  postgres-data:
    driver: local

networks:
  app-network:
    driver: bridge

secrets:
  db_password:
    external: true
```

## Comandos de producción

```bash
# Verificar configuración
docker compose -f docker compose.prod.yml config

# Iniciar en producción
docker compose -f docker compose.prod.yml up -d

# Ver logs
docker compose -f docker compose.prod.yml logs -f

# Actualizar servicio
docker compose -f docker compose.prod.yml pull
docker compose -f docker compose.prod.yml up -d

# Backup
./backup.sh

# Monitoreo
docker stats
docker compose -f docker compose.prod.yml ps
```

## Recursos adicionales

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [OWASP Docker Security](https://owasp.org/www-project-docker-top-10/)
- [Docker Production Guide](https://docs.docker.com/guides/)

## ¡Felicidades!

Has completado el curso de Docker. Ahora tienes las habilidades para:
- ✅ Crear y gestionar contenedores
- ✅ Construir imágenes optimizadas
- ✅ Orquestar aplicaciones con Docker Compose
- ✅ Desplegar aplicaciones en producción
- ✅ Implementar mejores prácticas de seguridad

¡Sigue practicando y experimentando!

