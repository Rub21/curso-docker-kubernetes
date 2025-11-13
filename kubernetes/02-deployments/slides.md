---
marp: true
theme: default
paginate: true
header: '02 - Deployments'
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

# 02 - Deployments

**Gestionar réplicas de Pods**

---

## Objetivo

Aprender a usar Deployments para gestionar múltiples réplicas de Pods y actualizaciones.

---

## ¿Qué aprenderás?

- ¿Qué es un Deployment?
- Crear y gestionar Deployments
- Escalar aplicaciones
- Actualizar aplicaciones (rolling updates)
- Hacer rollback de actualizaciones

---

## Limitaciones de los Pods

❌ Los Pods son **efímeros**
- Si un Pod falla, no se reinicia
- Si un Node falla, los Pods se pierden
- No hay forma de mantener múltiples réplicas

**Solución:** Deployments

---

## ¿Qué es un Deployment?

Un **Deployment** gestiona un conjunto de Pods idénticos.

- ✅ Mantiene el número deseado de réplicas
- ✅ Reinicia Pods que fallan
- ✅ Permite actualizaciones sin downtime
- ✅ Permite rollback de actualizaciones

---

## Ejemplo de Deployment

```yaml
apiVersion: apps/v1  # Versión de la API para Deployments (apps/v1 es la versión estable)
kind: Deployment      # Tipo de recurso: Deployment (gestiona Pods)
metadata:            # Metadatos del Deployment
  name: nginx-deployment  # Nombre único del Deployment dentro del namespace
spec:                # Especificación del Deployment
  replicas: 3        # Número de Pods que queremos mantener corriendo (siempre habrá 3 Pods)
  selector:          # Selector para identificar qué Pods gestiona este Deployment
    matchLabels:     # Los Pods deben tener estos labels para ser gestionados
      app: nginx    # Label que debe coincidir (app: nginx)
  template:         # Plantilla para crear los Pods (es como un Pod YAML dentro del Deployment)
    metadata:       # Metadatos que se aplicarán a cada Pod creado
      labels:       # Labels que se aplicarán a cada Pod
        app: nginx  # Label que debe coincidir con el selector (IMPORTANTE: debe coincidir)
    spec:           # Especificación del Pod (igual que en un Pod normal)
      containers:   # Lista de contenedores que correrán en cada Pod
      - name: nginx   # Nombre del contenedor
        image: nginx:1.20  # Imagen Docker a usar (versión específica: 1.20)
```

---

## Crear un Deployment

```bash
# Desde archivo YAML
kubectl apply -f deployment.yaml

# Ver Deployment
kubectl get deployments

# Ver Pods creados
kubectl get pods -l app=nginx
```

---

## Verificar Deployment

```bash
# Ver detalles
kubectl describe deployment nginx-deployment

# Ver estado
kubectl get deployment nginx-deployment

# Ver Pods gestionados
kubectl get pods -l app=nginx
```

---

## Escalar un Deployment

### Opción 1: Comando directo

```bash
kubectl scale deployment nginx-deployment --replicas=5
```

### Opción 2: Editar YAML

```bash
kubectl edit deployment nginx-deployment
```

### Opción 3: Actualizar archivo y aplicar

```bash
kubectl apply -f deployment.yaml
```

---

## Auto-escalado

```bash
# Instalar métricas server (requiere configuración adicional)
kubectl autoscale deployment nginx-deployment \
  --min=2 --max=10 --cpu-percent=80
```

**Nota:** Requiere métricas server instalado

---

## Actualizar un Deployment

### Rolling Update (por defecto)

```bash
# Cambiar imagen
kubectl set image deployment/nginx-deployment \
  nginx=nginx:1.21

# O editar el YAML y aplicar
kubectl apply -f deployment.yaml
```

Kubernetes actualiza gradualmente, sin downtime.

---

## Estrategias de Actualización

### Rolling Update (default)
- Actualiza Pods gradualmente
- Sin downtime
- Permite rollback

### Recreate
- Elimina todos los Pods antiguos
- Crea nuevos Pods
- Tiene downtime

---

## Verificar Actualización

```bash
# Ver estado de la actualización
kubectl rollout status deployment/nginx-deployment

# Ver historial
kubectl rollout history deployment/nginx-deployment

# Ver detalles de una revisión
kubectl rollout history deployment/nginx-deployment --revision=2
```

---

## Rollback

```bash
# Rollback a la versión anterior
kubectl rollout undo deployment/nginx-deployment

# Rollback a una revisión específica
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

---

## Pausar/Reanudar Actualización

```bash
# Pausar actualización
kubectl rollout pause deployment/nginx-deployment

# Hacer cambios
kubectl set image deployment/nginx-deployment nginx=nginx:1.22

# Reanudar
kubectl rollout resume deployment/nginx-deployment
```

---

## Buenas Prácticas

✅ **Usa labels consistentes** para selección

✅ **Especifica número de réplicas** apropiado

✅ **Usa rolling updates** para producción

✅ **Revisa el historial** antes de hacer rollback

---

## Resumen

- **Deployment** gestiona réplicas de Pods
- **Escalado** manual o automático
- **Rolling updates** sin downtime
- **Rollback** fácil de actualizaciones
- **Auto-recuperación** de Pods fallidos

---

## ¿Preguntas?

**Siguiente módulo:** Services

