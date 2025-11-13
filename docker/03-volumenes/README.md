# 03 - Volúmenes

## Objetivo
Aprender a usar volúmenes para persistir datos y compartir archivos entre el host y el contenedor.

## ¿Qué aprenderás?
- Tipos de volúmenes: bind mounts y named volumes
- Cómo persistir datos de bases de datos
- Compartir código entre host y contenedor para desarrollo

## Conceptos clave

### Bind Mount
Monta un directorio o archivo del host en el contenedor.

### Named Volume
Volumen gestionado por Docker, independiente del sistema de archivos del host.

## Ejercicio 1: Bind Mount para desarrollo

### Crear aplicación simple
```bash
# Crear archivo app.py
cat > app.py << 'EOF'
import os
from datetime import datetime

def main():
    data_dir = '/data'
    os.makedirs(data_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    message = f"Contenedor ejecutado el: {timestamp}\n"
    
    log_file = os.path.join(data_dir, 'log.txt')
    with open(log_file, 'a') as f:
        f.write(message)
    
    print(f"Log guardado en: {log_file}")
    print(f"Mensaje: {message}")

if __name__ == '__main__':
    main()
EOF
```

### Ejecutar con bind mount
```bash
# Crear directorio en el host
mkdir -p ./data

# Ejecutar contenedor montando el directorio
docker run --rm -v $(pwd)/data:/data python:3.9-slim python -c "
import os
from datetime import datetime

data_dir = '/data'
os.makedirs(data_dir, exist_ok=True)

timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
message = f'Contenedor ejecutado el: {timestamp}\n'

log_file = os.path.join(data_dir, 'log.txt')
with open(log_file, 'a') as f:
    f.write(message)

print(f'Log guardado en: {log_file}')
print(f'Mensaje: {message}')
"

# Ver el archivo en el host
cat ./data/log.txt
```

**Explicación:**
- `-v $(pwd)/data:/data`: Monta `./data` del host en `/data` del contenedor
- Los datos persisten después de que el contenedor se elimina

## Ejercicio 2: Named Volume para base de datos

### Ejecutar PostgreSQL con volumen
```bash
# Crear un volumen nombrado
docker volume create postgres-data

# Ejecutar PostgreSQL usando el volumen
docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=mi_password \
  -e POSTGRES_DB=mi_db \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15

# Verificar que está corriendo
docker ps

# Conectarse a la base de datos
docker exec -it postgres-db psql -U postgres -d mi_db

# Dentro de psql, crear una tabla:
CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nombre VARCHAR(100));
INSERT INTO usuarios (nombre) VALUES ('Juan');
SELECT * FROM usuarios;
\q

# Detener y eliminar el contenedor
docker stop postgres-db
docker rm postgres-db

# Volver a crear el contenedor (los datos persisten)
docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=mi_password \
  -e POSTGRES_DB=mi_db \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15

# Verificar que los datos siguen ahí
docker exec -it postgres-db psql -U postgres -d mi_db -c "SELECT * FROM usuarios;"
```

## Ejercicio 3: Desarrollo con hot-reload

### Dockerfile para desarrollo
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Ejecutar con bind mount para desarrollo
```bash
# En lugar de copiar el código, montamos el directorio
docker run -d \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  node:18-alpine npm start
```

**Explicación:**
- `-v $(pwd):/app`: Monta el código actual
- `-v /app/node_modules`: Volumen anónimo para node_modules (no se sobrescribe)

## Ejercicio 4: Gestionar volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar un volumen
docker volume inspect postgres-data

# Eliminar un volumen (¡cuidado, se pierden los datos!)
docker volume rm postgres-data

# Eliminar volúmenes no usados
docker volume prune
```

## Comandos clave
- `-v /ruta/host:/ruta/container`: Bind mount
- `-v nombre-volumen:/ruta/container`: Named volume
- `docker volume create`: Crear volumen nombrado
- `docker volume ls`: Listar volúmenes
- `docker volume inspect`: Ver detalles de un volumen

## Casos de uso
- **Bind Mount**: Desarrollo local, compartir configuración
- **Named Volume**: Bases de datos, datos que deben persistir
- **tmpfs**: Datos temporales en memoria (solo Linux)

## Siguiente paso
Aprende sobre redes Docker para conectar contenedores en el siguiente módulo.

