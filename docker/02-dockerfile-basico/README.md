# 02 - Dockerfile Básico

## Objetivo
Aprender a crear tus propias imágenes Docker usando Dockerfile.

## ¿Qué aprenderás?
- Sintaxis básica de Dockerfile
- Comandos: FROM, RUN, COPY, CMD, EXPOSE
- Cómo construir y ejecutar imágenes personalizadas

## Estructura del proyecto
```
02-dockerfile-basico/
├── README.md
├── Dockerfile
├── app.py
└── requirements.txt
```

## Ejercicio 1: Aplicación Python simple

### Paso 1: Crear la aplicación
Ya tienes `app.py` que es una aplicación Flask simple.

### Paso 2: Crear el Dockerfile
El `Dockerfile` contiene las instrucciones para construir la imagen:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
```

**Explicación línea por línea:**
- `FROM python:3.9-slim`: Imagen base (Python 3.9)
- `WORKDIR /app`: Establece el directorio de trabajo
- `COPY requirements.txt .`: Copia el archivo de dependencias
- `RUN pip install ...`: Instala las dependencias
- `COPY app.py .`: Copia la aplicación
- `EXPOSE 5000`: Documenta que la app usa el puerto 5000
- `CMD ["python", "app.py"]`: Comando por defecto al ejecutar

### Paso 3: Construir la imagen
```bash
docker build -t mi-app-python .
```

**Explicación:**
- `-t mi-app-python`: Nombre (tag) de la imagen
- `.`: Contexto de construcción (directorio actual)

### Paso 4: Ejecutar el contenedor
```bash
docker run -p 5000:5000 mi-app-python
```

Visita `http://localhost:5000` en tu navegador.

## Ejercicio 2: Optimizar el Dockerfile

### Versión mejorada con mejor caché
```dockerfile
FROM python:3.9-slim
WORKDIR /app
# Copiar solo requirements primero para aprovechar caché
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copiar el resto después
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
```

**¿Por qué es mejor?**
- Si solo cambias `app.py`, Docker reutiliza la capa de `pip install`
- Construcciones más rápidas

## Ejercicio 3: Variables de entorno
Modifica el Dockerfile para aceptar variables:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
ENV FLASK_ENV=production
EXPOSE 5000
CMD ["python", "app.py"]
```

Ejecuta con variable personalizada:
```bash
docker run -p 5000:5000 -e FLASK_ENV=development mi-app-python
```

## Comandos útiles
```bash
# Construir sin caché
docker build --no-cache -t mi-app-python .

# Ver historial de capas
docker history mi-app-python

# Construir con un tag específico
docker build -t mi-app-python:v1.0 .
```

## Buenas prácticas
1. ✅ Usa imágenes base oficiales y específicas (evita `latest`)
2. ✅ Ordena comandos de menos a más frecuentes cambios
3. ✅ Usa `.dockerignore` para excluir archivos innecesarios
4. ✅ Combina comandos RUN cuando sea posible
5. ✅ Usa usuarios no-root cuando sea posible

## Siguiente paso
Aprende sobre volúmenes para persistir datos en el siguiente módulo.

