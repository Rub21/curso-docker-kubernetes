---
marp: true
theme: default
paginate: true
header: '08 - Helm'
footer: 'Curso de Kubernetes'
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

# 08 - Helm

**Gestor de paquetes para Kubernetes**

---

## Objetivo

Aprender a usar Helm para instalar y gestionar aplicaciones en Kubernetes de forma sencilla.

---

## ¿Qué aprenderás?

- ¿Qué es Helm?
- Charts y Releases
- Instalar aplicaciones con Helm
- Crear tus propios Charts
- Helm Repositories
- Mejores prácticas

---

## Problema: Desplegar Aplicaciones Complejas

❌ Desplegar aplicaciones complejas manualmente:
- Muchos archivos YAML
- Difícil de versionar
- Difícil de reutilizar
- Difícil de actualizar

**Solución:** Helm

---

## ¿Qué es Helm?

**Helm** es el gestor de paquetes para Kubernetes.

- ✅ Empaqueta aplicaciones (Charts)
- ✅ Instala/actualiza/elimina fácilmente
- ✅ Gestiona dependencias
- ✅ Templates con valores configurables

**Analogía:** Helm es como `apt` o `npm` para Kubernetes

---

## Conceptos Clave

### Chart
- Paquete de recursos de Kubernetes
- Contiene templates y valores
- Similar a un "paquete"

### Release
- Instancia de un Chart desplegado
- Un Chart puede tener múltiples Releases

### Repository
- Lugar donde se almacenan Charts
- Similar a un repositorio de paquetes

---

## Instalar Helm

```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows
choco install kubernetes-helm

# Verificar
helm version
```

---

## Comandos Básicos

```bash
# Buscar Charts
helm search repo nginx

# Ver repositorios
helm repo list

# Agregar repositorio
helm repo add bitnami https://charts.bitnami.com/bitnami

# Actualizar repositorios
helm repo update
```

---

## Instalar un Chart

```bash
# Instalar desde repositorio
helm install my-nginx bitnami/nginx

# Instalar con nombre personalizado
helm install web-server bitnami/nginx --namespace production

# Ver releases instalados
helm list

# Ver detalles de un release
helm status my-nginx
```

---

## Valores Personalizados

### Opción 1: Valores inline

```bash
helm install my-nginx bitnami/nginx \
  --set service.type=LoadBalancer \
  --set replicaCount=3
```

### Opción 2: Archivo de valores

```yaml
# values.yaml - Valores por defecto del Chart
replicaCount: 3  # Número de réplicas (por defecto 3)
service:         # Configuración del Service
  type: LoadBalancer  # Tipo de Service (ClusterIP, NodePort, LoadBalancer)
  port: 80       # Puerto del Service
  # Estos valores se usan en los templates del Chart
  # Los usuarios pueden sobrescribirlos con --set o -f
```

```bash
helm install my-nginx bitnami/nginx -f values.yaml
```

---

## Actualizar un Release

```bash
# Actualizar con nuevos valores
helm upgrade my-nginx bitnami/nginx \
  --set replicaCount=5

# O con archivo de valores
helm upgrade my-nginx bitnami/nginx -f values.yaml

# Ver historial
helm history my-nginx

# Rollback
helm rollback my-nginx 1
```

---

## Eliminar un Release

```bash
# Eliminar release
helm uninstall my-nginx

# Ver releases (incluye eliminados)
helm list --all
```

---

## Estructura de un Chart

```
my-chart/
├── Chart.yaml          # Metadata del chart
├── values.yaml         # Valores por defecto
├── templates/          # Templates de recursos
│   ├── deployment.yaml
│   ├── service.yaml
│   └── _helpers.tpl    # Funciones helper
└── charts/            # Dependencias (opcional)
```

---

## Crear un Chart

```bash
# Crear chart básico
helm create my-app

# Estructura generada
tree my-app

# Instalar chart local
helm install my-app ./my-app

# Empaquetar chart
helm package my-app
```

---

## Chart.yaml

```yaml
apiVersion: v2  # Versión de la API de Helm Charts (v2 es la versión actual)
name: my-app    # Nombre del Chart (debe ser único en el repositorio)
description: A Helm chart for my application  # Descripción del Chart
type: application  # Tipo de Chart: application (aplicación) o library (biblioteca reutilizable)
version: 0.1.0  # Versión del Chart (sigue semver: major.minor.patch)
appVersion: "1.0.0"  # Versión de la aplicación que despliega este Chart
  # Ejemplo: Si despliega nginx:1.21, appVersion sería "1.21"
dependencies:   # Dependencias del Chart (otros Charts que necesita)
  - name: postgresql  # Nombre del Chart dependiente
    version: "11.0.0"  # Versión del Chart dependiente
    repository: "https://charts.bitnami.com/bitnami"  # Repositorio donde está el Chart
    condition: postgresql.enabled  # Condición para instalar (si postgresql.enabled es true)
      # Si condition es false, la dependencia no se instala
```

---

## Template con Valores

```yaml
# templates/deployment.yaml - Template de Deployment para Helm
# Los valores entre {{ }} se reemplazan con valores de values.yaml o --set
apiVersion: apps/v1  # Versión de la API para Deployments
kind: Deployment     # Tipo de recurso: Deployment
metadata:            # Metadatos del Deployment
  name: {{ .Values.name }}  # Nombre del Deployment (usa valor de values.yaml)
    # {{ .Values.name }} se reemplaza con el valor de name en values.yaml
spec:                # Especificación del Deployment
  replicas: {{ .Values.replicaCount }}  # Número de réplicas (usa valor de values.yaml)
    # {{ .Values.replicaCount }} se reemplaza con el valor de replicaCount
  template:         # Plantilla para crear Pods
    spec:           # Especificación del Pod
      containers:   # Lista de contenedores
      - name: {{ .Chart.Name }}  # Nombre del contenedor (usa nombre del Chart)
        # {{ .Chart.Name }} es una variable predefinida de Helm (nombre del Chart)
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}  # Imagen Docker
          # Construye la imagen usando valores de values.yaml
          # Ejemplo: nginx:1.21
        ports:       # Puertos del contenedor
        - containerPort: {{ .Values.service.port }}  # Puerto del contenedor
          # Usa el puerto definido en values.yaml
```

---

## values.yaml

```yaml
# values.yaml - Valores por defecto del Chart
# Define valores configurables que se usan en los templates
name: my-app  # Nombre de la aplicación (se usa en templates)
replicaCount: 3  # Número de réplicas del Deployment (por defecto 3)

image:       # Configuración de la imagen
  repository: nginx  # Repositorio de la imagen Docker
  tag: "1.21"       # Tag de la imagen (versión específica, no usar "latest")
    # Se construye como: {{ .Values.image.repository }}:{{ .Values.image.tag }}
    # Resultado: nginx:1.21

service:     # Configuración del Service
  type: ClusterIP  # Tipo de Service (ClusterIP, NodePort, LoadBalancer)
  port: 80         # Puerto del Service
    # Se usa en templates como: {{ .Values.service.port }}
```

---

## Funciones Helper

```yaml
# templates/_helpers.tpl - Funciones helper de Helm
# Define funciones reutilizables que se pueden usar en múltiples templates
{{- define "my-app.labels" -}}
app: {{ .Chart.Name }}      # Label app con el nombre del Chart
version: {{ .Chart.AppVersion }}  # Label version con la versión de la aplicación
  # {{ .Chart.Name }} = nombre del Chart (my-app)
  # {{ .Chart.AppVersion }} = versión de la aplicación (1.0.0)
{{- end -}}
  # La función define labels comunes que se pueden reutilizar
```

```yaml
# templates/deployment.yaml - Uso de la función helper
metadata:
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
    # include llama a la función helper
    # | nindent 4 agrega indentación de 4 espacios
    # Resultado:
    #   app: my-app
    #   version: 1.0.0
```

---

## Dependencias

```yaml
# Chart.yaml - Sección de dependencias
dependencies:   # Dependencias del Chart (otros Charts que necesita)
  - name: postgresql  # Nombre del Chart dependiente
    version: "11.0.0"  # Versión del Chart dependiente
    repository: "https://charts.bitnami.com/bitnami"  # Repositorio donde está el Chart
    condition: postgresql.enabled  # Condición para instalar (si postgresql.enabled es true)
      # Si condition es false, la dependencia no se instala
      # Ejemplo: Solo instalar postgresql si el usuario lo habilita en values.yaml
```

```bash
# Actualizar dependencias (descarga Charts dependientes)
helm dependency update
  # Descarga los Charts especificados en dependencies
  # Los guarda en charts/ como archivos .tgz

# Instalar con dependencias
helm install my-app ./my-app
  # Instala el Chart y todas sus dependencias
  # Las dependencias se instalan automáticamente
```

---

## Repositorios Comunes

- **Bitnami**: `https://charts.bitnami.com/bitnami`
- **Kubernetes**: `https://kubernetes.github.io/ingress-nginx`
- **Prometheus**: `https://prometheus-community.github.io/helm-charts`
- **Artifact Hub**: `https://artifacthub.io` (búsqueda)

---

## Buenas Prácticas

✅ **Usa Charts existentes** cuando sea posible

✅ **Versiona tus Charts** correctamente

✅ **Documenta valores** en values.yaml

✅ **Usa templates** para reutilización

✅ **Prueba Charts** antes de producción

---

## Resumen

- **Helm** = Gestor de paquetes para Kubernetes
- **Chart** = Paquete de recursos
- **Release** = Instancia desplegada
- **Templates** con valores configurables
- **Repositorios** para compartir Charts

---

## ¿Preguntas?

**Siguiente módulo:** Monitoreo

