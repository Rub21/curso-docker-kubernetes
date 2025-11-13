---
marp: true
theme: default
paginate: true
header: '01 - Primer Pod'
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

# 01 - Primer Pod

**Tu primera aplicación en Kubernetes**

---

## Objetivo

Aprender a crear y gestionar tu primer Pod en Kubernetes.

---

## ¿Qué aprenderás?

- ¿Qué es un Pod?
- Crear un Pod con kubectl
- Verificar el estado de Pods
- Ver logs de Pods
- Eliminar Pods

---

## ¿Qué es un Pod?

**Pod** = La unidad más pequeña y simple de Kubernetes

- Contiene uno o más contenedores
- Los contenedores comparten:
  - Red (misma IP)
  - Almacenamiento (volúmenes)
  - Namespace de procesos

---

## Analogía del Pod

```
┌─────────────────┐
│      Pod        │
│  ┌───────────┐  │
│  │ Contenedor│  │
│  │   nginx   │  │
│  └───────────┘  │
└─────────────────┘
```

**Un Pod = Una "caja" que contiene contenedores**

---

## Comandos Básicos de kubectl

### Verificar conexión al cluster

```bash
kubectl cluster-info
```

### Ver todos los Pods

```bash
kubectl get pods
```

### Ver Pods en todos los namespaces

```bash
kubectl get pods --all-namespaces
```

---

## Ejercicio 1: Crear un Pod Simple

### Opción 1: Comando directo

```bash
kubectl run nginx-pod --image=nginx:latest
```

### Opción 2: Archivo YAML (recomendado)

```yaml
apiVersion: v1  # Versión de la API de Kubernetes (v1 es para recursos básicos)
kind: Pod       # Tipo de recurso: Pod (unidad más pequeña en K8s)
metadata:       # Metadatos del Pod (información descriptiva)
  name: nginx-pod  # Nombre único del Pod dentro del namespace
spec:           # Especificación del Pod (qué debe contener)
  containers:   # Lista de contenedores que correrán en el Pod
  - name: nginx    # Nombre del contenedor dentro del Pod
    image: nginx:latest  # Imagen Docker a usar (nginx:latest)
```

---

## Crear Pod desde YAML

```bash
kubectl apply -f pod.yaml
```

O crear directamente:

```bash
kubectl create -f pod.yaml
```

---

## Verificar el Pod

```bash
# Ver Pods
kubectl get pods

# Ver detalles del Pod
kubectl describe pod nginx-pod

# Ver en formato YAML
kubectl get pod nginx-pod -o yaml
```

---

## Ver Logs del Pod

```bash
# Ver logs
kubectl logs nginx-pod

# Seguir logs (como tail -f)
kubectl logs -f nginx-pod

# Si el Pod tiene múltiples contenedores
kubectl logs nginx-pod -c nombre-contenedor
```

---

## Ejecutar Comandos en el Pod

```bash
# Ejecutar comando en el Pod
kubectl exec nginx-pod -- ls /

# Abrir shell interactivo
kubectl exec -it nginx-pod -- /bin/bash
```

---

## Estado del Pod

Los Pods pueden estar en diferentes estados:

- **Pending**: Esperando ser asignado a un Node
- **Running**: Ejecutándose correctamente
- **Succeeded**: Completado exitosamente
- **Failed**: Falló
- **Unknown**: Estado no puede ser determinado

---

## Verificar Estado

```bash
# Ver Pods con más información
kubectl get pods -o wide

# Ver eventos del cluster
kubectl get events

# Ver detalles de un Pod específico
kubectl describe pod nginx-pod
```

---

## Eliminar un Pod

```bash
# Eliminar por nombre
kubectl delete pod nginx-pod

# Eliminar desde archivo
kubectl delete -f pod.yaml

# Eliminar todos los Pods en un namespace
kubectl delete pods --all
```

---

## Ejercicio 2: Pod con Múltiples Contenedores

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
metadata:       # Metadatos del Pod
  name: multi-container-pod  # Nombre del Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores (puede tener uno o más)
  - name: nginx    # Primer contenedor: servidor web nginx
    image: nginx:latest  # Imagen de nginx
  - name: busybox  # Segundo contenedor: herramienta busybox (útil para debugging)
    image: busybox:latest  # Imagen de busybox
    command: ['sh', '-c', 'sleep 3600']  # Comando a ejecutar (mantiene el contenedor corriendo)
    # Nota: Los contenedores en un Pod comparten red (misma IP) y almacenamiento
```

---

## Buenas Prácticas

✅ **Usa archivos YAML** en lugar de comandos directos

✅ **Nombra tus Pods** de forma descriptiva

✅ **Revisa los logs** cuando algo falle

✅ **Usa `kubectl describe`** para debugging

---

## Limitaciones de los Pods

⚠️ Los Pods son **efímeros**:
- Si un Pod falla, no se reinicia automáticamente
- Si un Node falla, los Pods se pierden
- No hay balanceo de carga entre Pods

**Solución:** Usaremos Deployments en el siguiente módulo

---

## Resumen

- **Pod** = Unidad mínima en Kubernetes
- **kubectl** = Herramienta CLI principal
- Comandos: `get`, `describe`, `logs`, `exec`, `delete`
- **YAML** es la forma recomendada de crear recursos

---

## ¿Preguntas?

**Siguiente módulo:** Deployments

