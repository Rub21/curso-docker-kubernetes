---
marp: true
theme: default
paginate: true
header: '05 - Volúmenes Persistentes'
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

# 05 - Volúmenes Persistentes

**Almacenamiento persistente en Kubernetes**

---

## Objetivo

Aprender a usar PersistentVolumes y PersistentVolumeClaims para almacenamiento persistente en Kubernetes.

---

## ¿Qué aprenderás?

- ¿Qué son PV y PVC?
- Tipos de almacenamiento
- Crear PersistentVolumes
- Crear PersistentVolumeClaims
- Storage Classes
- Usar volúmenes en Pods

---

## Problema: Almacenamiento Efímero

❌ Los Pods tienen almacenamiento **efímero**:
- Si un Pod se elimina, se pierden los datos
- Los datos no persisten entre reinicios
- No se pueden compartir entre Pods

**Solución:** PersistentVolumes

---

## Conceptos Clave

### PersistentVolume (PV)
- Recurso del cluster (almacenamiento físico)
- Administrado por el administrador del cluster
- Ejemplo: disco NFS, EBS, etc.

### PersistentVolumeClaim (PVC)
- Solicitud de almacenamiento por un usuario
- Especifica tamaño y modo de acceso
- Se vincula a un PV disponible

---

## Flujo de Trabajo

```
1. Admin crea PV (recurso disponible)
2. Usuario crea PVC (solicita almacenamiento)
3. Kubernetes vincula PVC → PV
4. Usuario usa PVC en Pod
```

---

## Crear PersistentVolume

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: PersistentVolume  # Tipo de recurso: PersistentVolume (almacenamiento físico)
metadata:       # Metadatos del PV
  name: pv-example  # Nombre del PV (debe ser único en el cluster)
spec:           # Especificación del PV
  capacity:     # Capacidad del volumen
    storage: 10Gi  # Tamaño del volumen (10 Gibibytes)
  accessModes:  # Modos de acceso permitidos
  - ReadWriteOnce  # Lectura-escritura por un solo Node (RWO es el más común)
  persistentVolumeReclaimPolicy: Retain  # Qué hacer cuando se elimina el PVC
    # Retain = mantener volumen, Delete = eliminar automáticamente
  hostPath:     # Tipo de almacenamiento (hostPath = directorio del Node)
    path: /data/pv-example  # Ruta en el Node
    # ⚠️ Solo para desarrollo/testing, NO para producción
```

---

## Modos de Acceso

### ReadWriteOnce (RWO)
- Montado como lectura-escritura por un solo Node
- Múltiples Pods en el mismo Node pueden acceder

### ReadOnlyMany (ROX)
- Montado como solo lectura por muchos Nodes

### ReadWriteMany (RWX)
- Montado como lectura-escritura por muchos Nodes

---

## Políticas de Reclamación

### Retain
- Mantiene el volumen después de eliminar PVC
- Requiere limpieza manual

### Delete
- Elimina automáticamente el volumen
- Requiere soporte del storage provider

### Recycle (deprecated)
- Limpia el volumen para reutilización

---

## Crear PersistentVolumeClaim

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: PersistentVolumeClaim  # Tipo de recurso: PersistentVolumeClaim (solicitud de almacenamiento)
metadata:       # Metadatos del PVC
  name: pvc-example  # Nombre del PVC (debe ser único en el namespace)
spec:           # Especificación del PVC
  accessModes:  # Modos de acceso que necesitas
  - ReadWriteOnce  # Debe coincidir con un PV disponible
  resources:    # Recursos solicitados
    requests:   # Solicitud de recursos
      storage: 5Gi  # Tamaño de almacenamiento solicitado (5 Gibibytes)
      # Kubernetes encuentra un PV que tenga al menos este tamaño
```

---

## Usar PVC en Pod

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
metadata:       # Metadatos del Pod
  name: pod-with-pvc  # Nombre del Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: nginx  # Imagen Docker
    volumeMounts:  # Monta volúmenes en el contenedor
    - name: storage  # Nombre del volumen (debe coincidir con volumes)
      mountPath: /data  # Dónde se monta en el contenedor
      # Los datos escritos aquí persisten en el PVC
  volumes:      # Define los volúmenes a montar
  - name: storage  # Nombre del volumen
    persistentVolumeClaim:  # Volumen desde PVC
      claimName: pvc-example  # Nombre del PVC a usar
      # El PVC debe estar en estado "Bound" (vinculado a un PV)
```

---

## Storage Classes

Un **StorageClass** permite aprovisionamiento dinámico de PVs.

- El administrador define StorageClasses
- Los usuarios crean PVCs que referencian StorageClass
- Kubernetes crea PVs automáticamente

---

## Crear StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  fsType: ext4
```

---

## PVC con StorageClass

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-dynamic
spec:
  storageClassName: fast-ssd
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

---

## Tipos de Almacenamiento

### hostPath
- Monta directorio del Node
- Solo para desarrollo/testing
- No persistente entre Nodes

### NFS
- Network File System
- Compartido entre múltiples Pods
- Soporta ReadWriteMany

---

## Tipos de Almacenamiento (cont.)

### Cloud Storage
- **AWS**: EBS, EFS
- **GCP**: Persistent Disk
- **Azure**: Azure Disk, Azure File
- Aprovisionamiento dinámico disponible

---

## Verificar PVs y PVCs

```bash
# Ver PersistentVolumes
kubectl get pv

# Ver PersistentVolumeClaims
kubectl get pvc

# Ver detalles
kubectl describe pv pv-example
kubectl describe pvc pvc-example

# Ver StorageClasses
kubectl get storageclass
```

---

## Estado de PV

- **Available**: Disponible para ser reclamado
- **Bound**: Vinculado a un PVC
- **Released**: PVC eliminado, pero aún no reclamado
- **Failed**: Fallo en el volumen

---

## Buenas Prácticas

✅ **Usa StorageClasses** para aprovisionamiento dinámico

✅ **Elige el modo de acceso** correcto según tu caso

✅ **Considera el tamaño** necesario desde el inicio

✅ **No uses hostPath** en producción

---

## Resumen

- **PV** = Recurso de almacenamiento del cluster
- **PVC** = Solicitud de almacenamiento
- **StorageClass** = Aprovisionamiento dinámico
- **Modos de acceso**: RWO, ROX, RWX
- **Cloud storage** para producción

---

## ¿Preguntas?

**Siguiente módulo:** Ingress

