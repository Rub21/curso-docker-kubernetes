---
marp: true
theme: default
paginate: true
header: '07 - Namespaces'
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

# 07 - Namespaces

**Organización y multi-tenancy en Kubernetes**

---

## Objetivo

Aprender a usar Namespaces para organizar recursos y aislar aplicaciones en Kubernetes.

---

## ¿Qué aprenderás?

- ¿Qué es un Namespace?
- Crear y gestionar Namespaces
- Recursos por Namespace
- Resource Quotas
- LimitRanges
- Mejores prácticas de organización

---

## Problema: Recursos Mezclados

❌ Sin Namespaces:
- Todos los recursos en el mismo espacio
- Difícil de organizar
- Riesgo de conflictos de nombres
- Sin aislamiento

**Solución:** Namespaces

---

## ¿Qué es un Namespace?

Un **Namespace** es una división lógica del cluster.

- ✅ Organiza recursos
- ✅ Aísla recursos
- ✅ Permite multi-tenancy
- ✅ Facilita gestión

---

## Namespaces Predefinidos

### default
- Namespace por defecto
- Si no especificas, se usa este

### kube-system
- Recursos del sistema
- No modificar manualmente

### kube-public
- Recursos públicos
- Generalmente vacío

### kube-node-lease
- Heartbeats de Nodes
- Mantenido por Kubernetes

---

## Crear Namespace

### Opción 1: Comando directo

```bash
kubectl create namespace desarrollo
```

### Opción 2: Archivo YAML

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Namespace  # Tipo de recurso: Namespace (división lógica del cluster)
metadata:        # Metadatos del Namespace
  name: desarrollo  # Nombre del Namespace (debe ser único en el cluster)
    # Ejemplos comunes: desarrollo, staging, produccion, equipo-frontend, proyecto-a
    # Los nombres de recursos dentro del namespace deben ser únicos solo dentro del namespace
```

```bash
kubectl apply -f namespace.yaml
```

---

## Usar Namespace

### Especificar en recursos

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
metadata:       # Metadatos del Pod
  name: my-pod  # Nombre del Pod (debe ser único en el namespace)
  namespace: desarrollo  # Namespace donde se crea el Pod
    # Si no especificas namespace, se usa el namespace por defecto
    # Puedes cambiar el namespace por defecto con: kubectl config set-context --current --namespace=desarrollo
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: nginx  # Imagen Docker
    # Nota: Los recursos en diferentes namespaces están aislados lógicamente
    # Pero pueden comunicarse vía Services usando el nombre completo
```

### O usar contexto

```bash
kubectl config set-context --current --namespace=desarrollo
```

---

## Ver Recursos por Namespace

```bash
# Ver Pods en un namespace
kubectl get pods -n desarrollo

# Ver todos los recursos
kubectl get all -n desarrollo

# Ver en todos los namespaces
kubectl get pods --all-namespaces
```

---

## Cambiar Namespace por Defecto

```bash
# Ver namespace actual
kubectl config view --minify | grep namespace

# Cambiar namespace por defecto
kubectl config set-context --current --namespace=produccion

# Verificar
kubectl config view --minify | grep namespace
```

---

## Resource Quotas

Un **ResourceQuota** limita recursos por Namespace.

- CPU y memoria
- Número de Pods
- Número de Services
- Storage

---

## Crear ResourceQuota

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: ResourceQuota  # Tipo de recurso: ResourceQuota (límites de recursos por namespace)
metadata:        # Metadatos del ResourceQuota
  name: quota-desarrollo  # Nombre del ResourceQuota
  namespace: desarrollo  # Namespace al que aplica este ResourceQuota
    # El ResourceQuota limita recursos solo en este namespace
spec:            # Especificación del ResourceQuota
  hard:          # Límites duros (no se pueden exceder)
    requests.cpu: "4"      # Total de CPU requests permitidos en el namespace (4 cores)
    requests.memory: 8Gi   # Total de memoria requests permitidos en el namespace (8 Gibibytes)
    limits.cpu: "8"        # Total de CPU limits permitidos en el namespace (8 cores)
    limits.memory: 16Gi    # Total de memoria limits permitidos en el namespace (16 Gibibytes)
    pods: "10"             # Máximo número de Pods permitidos en el namespace
    services: "5"           # Máximo número de Services permitidos en el namespace
    # Otros recursos que se pueden limitar:
    # - persistentvolumeclaims: número de PVCs
    # - requests.storage: almacenamiento total solicitado
    # Si un recurso intenta exceder estos límites, Kubernetes rechaza la creación
```

---

## LimitRange

Un **LimitRange** define límites por recurso individual.

- Límites por Pod
- Límites por Container
- Requests y Limits por defecto

---

## Crear LimitRange

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: LimitRange  # Tipo de recurso: LimitRange (límites por recurso individual)
metadata:        # Metadatos del LimitRange
  name: limits-desarrollo  # Nombre del LimitRange
  namespace: desarrollo  # Namespace al que aplica este LimitRange
spec:            # Especificación del LimitRange
  limits:        # Lista de límites
  - default:     # Valores por defecto para limits (si el Pod no especifica limits)
      memory: "512Mi"  # Límite de memoria por defecto (512 Mebibytes)
      cpu: "500m"      # Límite de CPU por defecto (500 millicores = 0.5 cores)
    defaultRequest:  # Valores por defecto para requests (si el Pod no especifica requests)
      memory: "256Mi"  # Request de memoria por defecto (256 Mebibytes)
      cpu: "250m"      # Request de CPU por defecto (250 millicores = 0.25 cores)
    type: Container  # Tipo de recurso al que aplica (Container, Pod, PersistentVolumeClaim)
    # Si un Pod no especifica resources, usa estos valores por defecto
    # Útil para asegurar que todos los Pods tengan recursos definidos
    # Complementa ResourceQuota: LimitRange = por recurso, ResourceQuota = por namespace
```

---

## Verificar Quotas y Limits

```bash
# Ver ResourceQuotas
kubectl get resourcequota -n desarrollo
kubectl describe resourcequota quota-desarrollo -n desarrollo

# Ver LimitRanges
kubectl get limitrange -n desarrollo
kubectl describe limitrange limits-desarrollo -n desarrollo
```

---

## Casos de Uso Comunes

### Por Ambiente
- `desarrollo`, `staging`, `produccion`

### Por Equipo
- `equipo-frontend`, `equipo-backend`

### Por Proyecto
- `proyecto-a`, `proyecto-b`

### Por Cliente
- `cliente-1`, `cliente-2` (multi-tenancy)

---

## Recursos que NO están en Namespaces

Algunos recursos son **cluster-scoped**:

- Nodes
- PersistentVolumes
- StorageClasses
- Namespaces mismos

---

## Service Discovery entre Namespaces

Los Services son accesibles entre Namespaces:

```
<service-name>.<namespace>.svc.cluster.local
```

Ejemplo:
```
api-service.produccion.svc.cluster.local
```

---

## Buenas Prácticas

✅ **Usa Namespaces** para organizar recursos

✅ **Separa por ambiente** (dev, staging, prod)

✅ **Usa ResourceQuotas** para limitar recursos

✅ **Usa LimitRanges** para establecer defaults

✅ **No uses `default`** para producción

---

## Resumen

- **Namespace** = División lógica del cluster
- **Organiza** recursos por ambiente/equipo/proyecto
- **ResourceQuota** = Límites por Namespace
- **LimitRange** = Límites por recurso
- **Service Discovery** funciona entre Namespaces

---

## ¿Preguntas?

**Siguiente módulo:** Helm

