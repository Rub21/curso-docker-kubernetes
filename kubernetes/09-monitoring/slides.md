---
marp: true
theme: default
paginate: true
header: '09 - Monitoreo'
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

# 09 - Monitoreo

**Observabilidad y logging en Kubernetes**

---

## Objetivo

Aprender a monitorear aplicaciones y clusters de Kubernetes usando métricas, logs y herramientas de observabilidad.

---

## ¿Qué aprenderás?

- ¿Por qué monitorear?
- Métricas en Kubernetes
- Logging de aplicaciones
- Prometheus y Grafana
- Healthchecks y probes
- Alertas y dashboards

---

## ¿Por qué Monitorear?

✅ **Detectar problemas** antes de que afecten usuarios

✅ **Entender comportamiento** de aplicaciones

✅ **Optimizar recursos** (CPU, memoria)

✅ **Cumplir SLAs** y objetivos

✅ **Debugging** más rápido

---

## Pilares de Observabilidad

### Métricas (Metrics)
- Datos numéricos en el tiempo
- CPU, memoria, requests, etc.

### Logs
- Eventos y mensajes de aplicaciones
- Debugging y auditoría

### Traces
- Flujo de requests a través de servicios
- Performance y latencia

---

## Métricas en Kubernetes

Kubernetes expone métricas nativas:

- **Node metrics**: CPU, memoria, disco
- **Pod metrics**: CPU, memoria por Pod
- **Container metrics**: Recursos por contenedor

**Requiere:** Metrics Server instalado

---

## Ver Métricas

```bash
# Ver uso de recursos de Nodes
kubectl top nodes

# Ver uso de recursos de Pods
kubectl top pods

# Ver en un namespace específico
kubectl top pods -n production

# Ver con más detalles
kubectl top pods --containers
```

---

## Healthchecks: Liveness Probe

Detecta si un contenedor está **vivo**:

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    livenessProbe:  # Probe de liveness (verifica que el contenedor esté vivo)
      httpGet:      # Tipo de probe: HTTP GET request
        path: /health  # Ruta del endpoint de health check
        port: 8080     # Puerto donde escucha la aplicación
      initialDelaySeconds: 30  # Tiempo de espera antes de empezar a verificar (30 segundos)
        # Da tiempo a la aplicación para iniciar
      periodSeconds: 10  # Frecuencia de verificación (cada 10 segundos)
        # Kubernetes verifica el health check cada 10 segundos
        # Si el probe falla (endpoint no responde o retorna error), Kubernetes reinicia el contenedor
```

Si falla → Kubernetes reinicia el contenedor

---

## Healthchecks: Readiness Probe

Detecta si un contenedor está **listo** para recibir tráfico:

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    readinessProbe:  # Probe de readiness (verifica que el contenedor esté listo)
      httpGet:      # Tipo de probe: HTTP GET request
        path: /ready  # Ruta del endpoint de readiness check
        port: 8080    # Puerto donde escucha la aplicación
      initialDelaySeconds: 5  # Tiempo de espera antes de empezar a verificar (5 segundos)
        # Más corto que liveness porque queremos saber rápido si está listo
      periodSeconds: 5  # Frecuencia de verificación (cada 5 segundos)
        # Si el probe falla: Pod se marca como "Not Ready", Service NO envía tráfico
```

Si falla → Service no envía tráfico al Pod

---

## Healthchecks: Startup Probe

Detecta si un contenedor ha **iniciado**:

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    startupProbe:  # Probe de startup (verifica que el contenedor haya iniciado)
      httpGet:      # Tipo de probe: HTTP GET request
        path: /startup  # Ruta del endpoint de startup check
        port: 8080      # Puerto donde escucha la aplicación
      failureThreshold: 30  # Número de fallos permitidos antes de considerar que falló
        # Con periodSeconds: 10, esto permite hasta 30 * 10 = 300 segundos (5 minutos) para iniciar
      periodSeconds: 10  # Frecuencia de verificación (cada 10 segundos)
        # Una vez que el startup probe tiene éxito, liveness y readiness toman el control
```

Útil para aplicaciones que tardan en iniciar

---

## Tipos de Probes

### httpGet
- Hace request HTTP
- Útil para APIs web

### exec
- Ejecuta comando
- Útil para scripts

### tcpSocket
- Verifica puerto TCP
- Útil para servicios no HTTP

---

## Ver Logs

```bash
# Logs de un Pod
kubectl logs my-pod

# Logs de un contenedor específico
kubectl logs my-pod -c container-name

# Seguir logs (tail -f)
kubectl logs -f my-pod

# Logs de todos los Pods con label
kubectl logs -l app=myapp

# Logs de un Deployment
kubectl logs deployment/my-deployment
```

---

## Prometheus

**Prometheus** es un sistema de monitoreo y alertas.

- ✅ Recolecta métricas
- ✅ Almacena time-series
- ✅ Query language (PromQL)
- ✅ Alertas configurables

---

## Instalar Prometheus

```bash
# Agregar repositorio
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Instalar
helm install prometheus prometheus-community/kube-prometheus-stack
```

---

## Grafana

**Grafana** es una plataforma de visualización.

- ✅ Dashboards interactivos
- ✅ Múltiples fuentes de datos
- ✅ Alertas visuales
- ✅ Integración con Prometheus

---

## Instalar Grafana

```bash
# Instalar con Helm
helm install grafana grafana/grafana

# Obtener contraseña
kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 -d

# Port-forward para acceder
kubectl port-forward svc/grafana 3000:80
```

Acceder en: `http://localhost:3000`

---

## Logging: Fluentd / Fluent Bit

**Fluentd** recolecta y envía logs a sistemas centralizados.

```yaml
# Ejemplo de DaemonSet para logging
apiVersion: apps/v1  # Versión de la API para DaemonSets
kind: DaemonSet       # Tipo de recurso: DaemonSet (un Pod por Node)
metadata:             # Metadatos del DaemonSet
  name: fluentd       # Nombre del DaemonSet
spec:                 # Especificación del DaemonSet
  selector:           # Selector para identificar Pods gestionados
    matchLabels:      # Labels que deben coincidir
      app: fluentd    # Label app: fluentd
  template:           # Plantilla para crear Pods (similar a Deployment)
    metadata:         # Metadatos del Pod
      labels:         # Labels del Pod
        app: fluentd  # Label app (debe coincidir con selector)
    spec:             # Especificación del Pod
      containers:     # Lista de contenedores
      - name: fluentd  # Nombre del contenedor
        image: fluent/fluentd-kubernetes-daemonset  # Imagen de Fluentd
        # Fluentd recolecta logs de /var/log/containers/* y /var/log/pods/*
        # Y los envía a sistemas centralizados (Elasticsearch, etc.)
```

---

## Logging: Elasticsearch + Kibana

Stack completo para logging:

- **Elasticsearch**: Almacena logs
- **Kibana**: Visualiza y busca logs
- **Filebeat/Fluentd**: Recolecta logs

```bash
# Instalar con Helm
helm install elasticsearch elastic/elasticsearch
helm install kibana elastic/kibana
```

---

## Alertas

### AlertManager (Prometheus)

```yaml
# Ejemplo de alerta
groups:
- name: kubernetes
  rules:
  - alert: HighCPUUsage
    expr: cpu_usage > 80
    for: 5m
    annotations:
      summary: "High CPU usage detected"
```

---

## Dashboards Comunes

### Kubernetes Dashboard
- UI oficial de Kubernetes
- Ver recursos y estado

### Grafana Dashboards
- Pre-built dashboards
- Personalizables

### Prometheus UI
- Query PromQL
- Ver métricas en tiempo real

---

## Mejores Prácticas

✅ **Implementa healthchecks** en todos los Pods

✅ **Centraliza logs** (no solo kubectl logs)

✅ **Monitorea recursos** (CPU, memoria, disco)

✅ **Configura alertas** para problemas críticos

✅ **Revisa dashboards** regularmente

---

## Resumen

- **Métricas** = Datos numéricos (CPU, memoria)
- **Logs** = Eventos y mensajes
- **Healthchecks** = Liveness, Readiness, Startup
- **Prometheus** = Recolecta métricas
- **Grafana** = Visualiza métricas
- **Centraliza logs** para debugging

---

## ¿Preguntas?

**Siguiente módulo:** Producción

