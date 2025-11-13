# 04 - Redes Docker

## Objetivo
Aprender a gestionar redes Docker para conectar contenedores entre sí.

## ¿Qué aprenderás?
- Tipos de redes Docker
- Cómo conectar contenedores en la misma red
- Comunicación entre contenedores por nombre

## Tipos de redes

### 1. Bridge (por defecto)
Red interna de Docker. Los contenedores pueden comunicarse por nombre.

### 2. Host
El contenedor usa la red del host directamente.

### 3. None
Sin conectividad de red.

## Ejercicio 1: Red bridge por defecto

### Crear dos contenedores en la misma red
```bash
# Crear un contenedor con un servidor web
docker run -d --name web-server nginx:latest

# Crear otro contenedor y conectarlo a la misma red
docker run -d --name web-server-2 nginx:latest

# Ver en qué red están
docker network inspect bridge

# Los contenedores pueden comunicarse por IP, pero no por nombre
# (en la red bridge por defecto)
```

## Ejercicio 2: Red personalizada

### Crear una red personalizada
```bash
# Crear una red llamada "mi-red"
docker network create mi-red

# Ver redes disponibles
docker network ls

# Inspeccionar la red
docker network inspect mi-red
```

### Conectar contenedores a la red personalizada
```bash
# Ejecutar contenedores en la red personalizada
docker run -d --name app-1 --network mi-red nginx:latest
docker run -d --name app-2 --network mi-red nginx:latest

# Ahora pueden comunicarse por nombre
docker exec app-1 ping -c 3 app-2
docker exec app-2 ping -c 3 app-1
```

## Ejercicio 3: Aplicación con base de datos

### Crear red para la aplicación
```bash
docker network create app-network
```

### Ejecutar base de datos
```bash
docker run -d \
  --name postgres-db \
  --network app-network \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mi_app \
  postgres:15
```

### Crear aplicación Python que se conecta a la DB
```python
# app.py
import psycopg2
import os
from flask import Flask

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        host='postgres-db',  # Nombre del contenedor
        database='mi_app',
        user='postgres',
        password='password'
    )
    return conn

@app.route('/')
def index():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT version();')
        version = cur.fetchone()
        cur.close()
        conn.close()
        return f'<h1>Conectado a PostgreSQL</h1><p>{version[0]}</p>'
    except Exception as e:
        return f'<h1>Error</h1><p>{str(e)}</p>', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Dockerfile para la app
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Construir y ejecutar la aplicación
```bash
# Construir la imagen
docker build -t mi-app .

# Ejecutar en la misma red
docker run -d \
  --name mi-app \
  --network app-network \
  -p 5000:5000 \
  mi-app

# Probar la conexión
curl http://localhost:5000
```

## Ejercicio 4: Red host

### Usar red del host
```bash
# El contenedor usa directamente la red del host
docker run --rm --network host nginx:latest

# Accesible directamente en localhost:80
# (sin necesidad de -p)
```

**Nota:** Solo funciona en Linux. En macOS/Windows usa bridge.

## Ejercicio 5: Gestionar redes

```bash
# Listar redes
docker network ls

# Inspeccionar una red
docker network inspect mi-red

# Desconectar un contenedor de una red
docker network disconnect mi-red app-1

# Conectar un contenedor a una red
docker network connect mi-red app-1

# Eliminar una red (primero desconecta todos los contenedores)
docker network rm mi-red

# Eliminar redes no usadas
docker network prune
```

## Ejercicio 6: Red con alias

### Crear red con alias personalizado
```bash
docker network create --driver bridge app-network
```

### Usar alias al ejecutar contenedores
```bash
docker run -d \
  --name db \
  --network app-network \
  --network-alias database \
  postgres:15

# Ahora puedes conectarte usando "database" o "db"
```

## Comandos clave
- `docker network create`: Crear red
- `docker network ls`: Listar redes
- `docker network inspect`: Ver detalles
- `--network`: Especificar red al ejecutar
- `docker network connect/disconnect`: Conectar/desconectar contenedores

## Mejores prácticas
1. ✅ Usa redes personalizadas para aislar aplicaciones
2. ✅ Los contenedores se comunican por nombre en la misma red
3. ✅ No expongas puertos innecesarios al host
4. ✅ Usa alias para hacer el código más legible

## Siguiente paso
Aprende Docker Compose para orquestar múltiples contenedores en el siguiente módulo.

