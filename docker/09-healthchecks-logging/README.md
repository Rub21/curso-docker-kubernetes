# 09 - Healthchecks y Logging

## Objetivo
Aprender a implementar healthchecks y gestionar logs en contenedores Docker.

## ¿Qué aprenderás?
- Implementar healthchecks en Dockerfiles
- Configurar healthchecks en Docker Compose
- Gestionar logs de contenedores
- Drivers de logging y rotación

## Healthchecks

Los healthchecks permiten a Docker verificar si un contenedor está funcionando correctamente.

## Ejercicio 1: Healthcheck en Dockerfile

### Dockerfile con healthcheck
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "app.py"]
```

**Parámetros:**
- `--interval`: Tiempo entre checks (default: 30s)
- `--timeout`: Tiempo máximo de espera (default: 30s)
- `--start-period`: Tiempo inicial sin fallos (default: 0s)
- `--retries`: Intentos antes de marcar como unhealthy (default: 3)
- `CMD`: Comando a ejecutar

### Aplicación con endpoint de health
```python
# app.py
from flask import Flask, jsonify
import time

app = Flask(__name__)
start_time = time.time()

@app.route('/')
def hello():
    return '<h1>Mi Aplicación</h1>'

@app.route('/health')
def health():
    uptime = time.time() - start_time
    return jsonify({
        'status': 'healthy',
        'uptime': uptime
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Verificar healthcheck
```bash
# Construir imagen
docker build -t mi-app .

# Ejecutar
docker run -d --name app -p 5000:5000 mi-app

# Ver estado del healthcheck
docker ps  # Muestra (healthy) o (unhealthy)

# Ver detalles
docker inspect --format='{{json .State.Health}}' app | python -m json.tool
```

## Ejercicio 2: Healthcheck en Docker Compose

### docker compose.yml con healthchecks
```yaml

services:
  web:
    build: ./app
    ports:
      - "5000:5000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

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

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      web:
        condition: service_healthy  # Espera a que web esté healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

## Ejercicio 3: Healthcheck avanzado

### Healthcheck con script personalizado
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

COPY app.py healthcheck.sh .
RUN chmod +x healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD ./healthcheck.sh

CMD ["python", "app.py"]
```

### healthcheck.sh
```bash
#!/bin/sh
# Verifica que la app responda y la DB esté accesible
curl -f http://localhost:5000/health || exit 1
```

## Logging

## Ejercicio 4: Ver logs básicos

```bash
# Ver logs de un contenedor
docker logs <container_id>

# Seguir logs en tiempo real
docker logs -f <container_id>

# Últimas N líneas
docker logs --tail 100 <container_id>

# Logs con timestamp
docker logs -t <container_id>

# Logs desde una fecha
docker logs --since 2024-01-01T00:00:00 <container_id>
```

## Ejercicio 5: Drivers de logging

### Configurar driver de logging
```bash
# Ejecutar con driver json-file (default)
docker run -d --name app mi-app

# Ejecutar con driver syslog
docker run -d \
  --name app \
  --log-driver syslog \
  --log-opt syslog-address=udp://localhost:514 \
  mi-app

# Ejecutar con driver local (rotación automática)
docker run -d \
  --name app \
  --log-driver local \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  mi-app
```

## Ejercicio 6: Logging en Docker Compose

### docker compose.yml con logging
```yaml

services:
  web:
    build: ./app
    ports:
      - "5000:5000"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "production"

  db:
    image: postgres:15
    logging:
      driver: "local"
      options:
        max-size: "50m"
        max-file: "5"
```

## Ejercicio 7: Centralizar logs

### Usar Fluentd
```yaml

services:
  web:
    build: ./app
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: "docker.web"

  fluentd:
    image: fluent/fluentd:latest
    volumes:
      - ./fluentd.conf:/fluentd/etc/fluent.conf
    ports:
      - "24224:24224"
```

## Ejercicio 8: Logging estructurado

### Aplicación con logging estructurado
```python
# app.py
import json
import logging
import sys
from flask import Flask

# Configurar logging JSON
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        return json.dumps(log_entry)

logger = logging.getLogger()
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

app = Flask(__name__)

@app.route('/')
def hello():
    logger.info('Request recibida en /')
    return '<h1>Mi Aplicación</h1>'

@app.route('/health')
def health():
    logger.info('Health check ejecutado')
    return {'status': 'ok'}, 200
```

## Ejercicio 9: Monitoreo con healthchecks

### Script de monitoreo
```bash
#!/bin/bash
# monitor.sh

CONTAINER="mi-app"

while true; do
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER)
    
    if [ "$HEALTH" != "healthy" ]; then
        echo "ALERTA: Contenedor $CONTAINER está $HEALTH"
        # Enviar notificación, reiniciar, etc.
    fi
    
    sleep 30
done
```

## Comandos útiles

```bash
# Ver logs de Docker Compose
docker compose logs
docker compose logs -f web
docker compose logs --tail=50 web

# Ver eventos de contenedor
docker events

# Inspeccionar configuración de logging
docker inspect --format='{{json .HostConfig.LogConfig}}' <container>

# Limpiar logs
docker system prune --volumes
```

## Mejores prácticas

1. ✅ Implementa healthchecks en todas las aplicaciones
2. ✅ Usa endpoints `/health` o `/healthz`
3. ✅ Configura rotación de logs (max-size, max-file)
4. ✅ Usa logging estructurado (JSON)
5. ✅ Centraliza logs en producción
6. ✅ Monitorea el estado de healthchecks
7. ✅ Ajusta intervalos según necesidades

## Siguiente paso
Aprende mejores prácticas para producción y despliegue.

