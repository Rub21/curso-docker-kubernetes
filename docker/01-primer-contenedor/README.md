# 01 - Primer Contenedor Sencillo

## Objetivo
Aprender a ejecutar tu primer contenedor Docker de forma sencilla.

## ¿Qué aprenderás?
- Cómo ejecutar un contenedor básico
- Comandos fundamentales: `docker run`, `docker ps`, `docker stop`
- Diferencia entre contenedor e imagen

## Ejercicios

### Ejercicio 1: Hola Mundo
Ejecuta tu primer contenedor con la imagen oficial de "hello-world":

```bash
docker run hello-world
```

**¿Qué pasó?**
- Docker descargó la imagen `hello-world` (si no la tenías)
- Creó un contenedor a partir de esa imagen
- El contenedor ejecutó y mostró un mensaje
- El contenedor se detuvo automáticamente

### Ejercicio 2: Contenedor interactivo
Ejecuta un contenedor con Ubuntu de forma interactiva:

```bash
docker run -it ubuntu:latest /bin/bash
```

**Comandos útiles dentro del contenedor:**
```bash
# Ver la versión del sistema
cat /etc/os-release

# Instalar algo
apt-get update
apt-get install -y curl

# Salir del contenedor
exit
```

### Ejercicio 3: Ver contenedores
Abre una nueva terminal y ejecuta:

```bash
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Ver imágenes descargadas
docker images
```

### Ejercicio 4: Contenedor en segundo plano
Ejecuta un contenedor que se mantenga corriendo:

```bash
# Ejecutar un servidor web simple
docker run -d -p 8080:80 nginx:latest
```

**Explicación:**
- `-d`: ejecuta en modo detached (segundo plano)
- `-p 8080:80`: mapea el puerto 80 del contenedor al 8080 de tu máquina

Abre tu navegador en `http://localhost:8080` para ver la página de bienvenida de Nginx.

### Ejercicio 5: Detener y eliminar contenedores
```bash
# Ver contenedores en ejecución
docker ps

# Detener un contenedor (usa el ID o nombre)
docker stop <container_id>

# Eliminar un contenedor
docker rm <container_id>

# Detener y eliminar en un solo comando
docker rm -f <container_id>
```

## Comandos clave aprendidos
- `docker run`: Crea y ejecuta un contenedor
- `docker ps`: Lista contenedores en ejecución
- `docker ps -a`: Lista todos los contenedores
- `docker stop`: Detiene un contenedor
- `docker rm`: Elimina un contenedor
- `docker images`: Lista imágenes descargadas

## Conceptos importantes
- **Imagen**: Plantilla read-only para crear contenedores
- **Contenedor**: Instancia ejecutable de una imagen
- **Puerto**: Mapeo entre puerto del host y del contenedor

## Siguiente paso
En el siguiente módulo aprenderás a crear tus propias imágenes con Dockerfile.

