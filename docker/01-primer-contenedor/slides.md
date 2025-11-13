---
marp: true
theme: default
paginate: true
header: '01 - Primer Contenedor Sencillo'
footer: 'Curso de Docker'
style: |
  section {
    font-size: 24px;
  }
  code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
  }
---

# 01 - Primer Contenedor Sencillo

**Curso de Docker - De Básico a Avanzado**

---

## Objetivo

Aprender a ejecutar tu primer contenedor Docker de forma sencilla.

---

## ¿Qué aprenderás?

- Cómo ejecutar un contenedor básico
- Comandos fundamentales: `docker run`, `docker ps`, `docker stop`
- Diferencia entre contenedor e imagen

---

## Conceptos Clave (Resumen)

<!-- > **Nota:** Para una explicación detallada, revisa el Módulo 00 - Conceptos Básicos -->

### Imagen
Plantilla **read-only** para crear contenedores

### Contenedor
Instancia **ejecutable** de una imagen

---

## Ejercicio 1: Hola Mundo

```bash
docker run hello-world
```

**¿Qué pasó?**
- Docker descargó la imagen `hello-world`
- Creó un contenedor a partir de esa imagen
- El contenedor ejecutó y mostró un mensaje
- El contenedor se detuvo automáticamente

---

## Ejercicio 2: Contenedor Interactivo

```bash
docker run -it ubuntu:latest /bin/bash
```

**Comandos útiles dentro del contenedor:**
```bash
cat /etc/os-release
apt-get update
exit
```

---

## Ejercicio 3: Ver Contenedores

```bash
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores
docker ps -a

# Ver imágenes descargadas
docker images
```

---

## Ejercicio 4: Contenedor en Segundo Plano

```bash
docker run -d -p 8080:80 nginx:latest
```

**Explicación:**
- `-d`: ejecuta en modo detached (segundo plano)
- `-p 8080:80`: mapea puerto 80 del contenedor al 8080 del host

Abre `http://localhost:8080` en tu navegador

---

## Ejercicio 5: Detener y Eliminar

```bash
# Detener un contenedor
docker stop <container_id>

# Eliminar un contenedor
docker rm <container_id>

# Detener y eliminar en un solo comando
docker rm -f <container_id>
```

---

## Comandos Clave Aprendidos

| Comando | Descripción |
|---------|-------------|
| `docker run` | Crea y ejecuta un contenedor |
| `docker ps` | Lista contenedores en ejecución |
| `docker ps -a` | Lista todos los contenedores |
| `docker stop` | Detiene un contenedor |
| `docker rm` | Elimina un contenedor |
| `docker images` | Lista imágenes descargadas |

---

## Conceptos Importantes

- **Imagen**: Plantilla read-only para crear contenedores
- **Contenedor**: Instancia ejecutable de una imagen
- **Puerto**: Mapeo entre puerto del host y del contenedor

---

## Práctica

1. Ejecuta `docker run hello-world`
2. Ejecuta un contenedor interactivo de Ubuntu
3. Ejecuta Nginx en segundo plano
4. Lista los contenedores en ejecución
5. Detén y elimina los contenedores

---

## Siguiente Paso

En el siguiente módulo aprenderás a crear tus propias imágenes con Dockerfile.

**Módulo 02: Dockerfile Básico**

---

## Preguntas?

¡Tiempo para preguntas y práctica!

