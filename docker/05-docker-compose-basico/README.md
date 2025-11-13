# 05 - Docker Compose Básico

## Objetivo
Aprender a usar Docker Compose para orquestar múltiples contenedores con un solo archivo.

## ¿Qué aprenderás?
- Sintaxis de docker compose.yml
- Cómo definir servicios, volúmenes y redes
- Comandos básicos de Docker Compose

## ¿Qué es Docker Compose?
Herramienta para definir y ejecutar aplicaciones multi-contenedor. Usa un archivo YAML para configurar los servicios.

## Ejercicio 1: Aplicación web + base de datos

### Estructura del proyecto
```
05-docker compose-basico/
├── README.md
├── docker compose.yml
├── app/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
└── .env (opcional)
```

### docker compose.yml
```yaml
services:
  web:
    build: ./app
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mi_app
    depends_on:
      - db
    volumes:
      - ./app:/app
    networks:
      - app-network

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mi_app
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### Explicación del archivo
- **services**: Define los contenedores (servicios)
- **web**: Servicio de la aplicación
  - `build`: Construye desde Dockerfile
  - `ports`: Mapeo de puertos
  - `environment`: Variables de entorno
  - `depends_on`: Dependencias (espera a que db esté lista)
  - `volumes`: Montajes de volúmenes
- **db**: Servicio de base de datos
- **volumes**: Volúmenes nombrados
- **networks**: Redes personalizadas

## Comandos básicos

### Iniciar servicios
```bash
# Construir e iniciar todos los servicios
docker compose up

# En modo detached (segundo plano)
docker compose up -d

# Construir sin caché
docker compose build --no-cache
```

### Ver estado
```bash
# Ver servicios en ejecución
docker compose ps

# Ver logs
docker compose logs

# Ver logs de un servicio específico
docker compose logs web

# Seguir logs en tiempo real
docker compose logs -f
```

### Detener servicios
```bash
# Detener servicios (mantiene contenedores)
docker compose stop

# Detener y eliminar contenedores
docker compose down

# Eliminar también volúmenes
docker compose down -v
```

### Ejecutar comandos
```bash
# Ejecutar comando en un servicio
docker compose exec web python manage.py migrate

# Ejecutar comando en servicio nuevo (temporal)
docker compose run web python manage.py shell
```

## Ejercicio 2: Variables de entorno

### Crear archivo .env
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mi_password_seguro
POSTGRES_DB=mi_app
```

### Actualizar docker compose.yml
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    # ...
```

## Ejercicio 3: Múltiples entornos

### docker compose.dev.yml
```yaml
services:
  web:
    build: ./app
    volumes:
      - ./app:/app  # Hot reload en desarrollo
    environment:
      - FLASK_ENV=development
```

### docker compose.prod.yml
```yaml
services:
  web:
    image: mi-app:latest
    restart: always
    environment:
      - FLASK_ENV=production
```

### Usar archivos específicos
```bash
# Desarrollo
docker compose -f docker compose.yml -f docker compose.dev.yml up

# Producción
docker compose -f docker compose.yml -f docker compose.prod.yml up
```

## Ejercicio 4: Healthchecks

### Agregar healthcheck al docker compose.yml
```yaml
services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    build: ./app
    depends_on:
      db:
        condition: service_healthy  # Espera a que db esté healthy
```

## Comandos útiles
```bash
# Reconstruir un servicio específico
docker compose build web

# Reiniciar un servicio
docker compose restart web

# Escalar un servicio (ej: 3 instancias de web)
docker compose up -d --scale web=3

# Ver uso de recursos
docker compose top

# Validar el archivo compose
docker compose config
```

## Buenas prácticas
1. ✅ Usa `depends_on` para ordenar el inicio
2. ✅ Usa healthchecks para dependencias críticas
3. ✅ Separa archivos para dev/prod
4. ✅ Usa variables de entorno para configuración
5. ✅ Define redes y volúmenes explícitamente

## Siguiente paso
Aprende sobre multi-stage builds para optimizar tus imágenes en el siguiente módulo.

