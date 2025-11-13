---
marp: true
theme: default
paginate: true
header: '03 - Services'
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

# 03 - Services

**Exponer aplicaciones en el cluster**

---

## Objetivo

Aprender a usar Services para exponer aplicaciones y permitir comunicación entre Pods.

---

## ¿Qué aprenderás?

- ¿Qué es un Service?
- Tipos de Services
- Crear Services
- Conectar Pods mediante Services
- Service Discovery

---

## Problema: IPs Dinámicas

❌ Los Pods tienen IPs **dinámicas**
- Si un Pod se reinicia, cambia su IP
- No hay forma estable de conectarse a un Pod
- ¿Cómo se comunican los Pods entre sí?

**Solución:** Services

---

## ¿Qué es un Service?

Un **Service** es una abstracción que expone un conjunto de Pods como un servicio de red.

- ✅ IP y DNS estables
- ✅ Balanceo de carga automático
- ✅ Service Discovery
- ✅ Abstrae la complejidad de los Pods

---

## Tipos de Services

### ClusterIP (default)
- IP interna del cluster
- Solo accesible desde dentro del cluster

### NodePort
- Expone el Service en un puerto del Node
- Accesible desde fuera del cluster

### LoadBalancer
- Crea un balanceador de carga externo
- Requiere soporte del cloud provider

---

## Service: ClusterIP

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Service    # Tipo de recurso: Service (expone Pods como servicio de red)
metadata:        # Metadatos del Service
  name: nginx-service  # Nombre del Service (se usa para Service Discovery)
spec:            # Especificación del Service
  type: ClusterIP  # Tipo de Service (ClusterIP es el default, IP interna del cluster)
  selector:      # Selector para encontrar los Pods que expone este Service
    app: nginx   # Label que deben tener los Pods (debe coincidir con labels de los Pods)
  ports:         # Lista de puertos que expone el Service
  - port: 80     # Puerto del Service (lo que otros Pods usan para conectarse)
    targetPort: 80  # Puerto del Pod (donde la aplicación escucha, puede ser diferente)
```

---

## Service: NodePort

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Service    # Tipo de recurso: Service
metadata:        # Metadatos del Service
  name: nginx-service  # Nombre del Service
spec:            # Especificación del Service
  type: NodePort  # Tipo de Service (expone puerto en cada Node)
  selector:      # Selector para encontrar los Pods
    app: nginx   # Label que deben tener los Pods
  ports:         # Lista de puertos
  - port: 80     # Puerto del Service (interno)
    targetPort: 80  # Puerto del Pod (donde la aplicación escucha)
    nodePort: 30080  # Puerto expuesto en cada Node (rango válido: 30000-32767)
    # Accesible desde fuera del cluster en: <NODE_IP>:30080
```

Accesible en: `<NODE_IP>:30080`

---

## Service: LoadBalancer

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Service    # Tipo de recurso: Service
metadata:        # Metadatos del Service
  name: nginx-service  # Nombre del Service
spec:            # Especificación del Service
  type: LoadBalancer  # Tipo de Service (crea balanceador externo)
  selector:      # Selector para encontrar los Pods
    app: nginx   # Label que deben tener los Pods
  ports:         # Lista de puertos
  - port: 80     # Puerto del Service
    targetPort: 80  # Puerto del Pod
    # Nota: El cloud provider crea automáticamente un balanceador de carga
    # y asigna una IP externa (puede tardar unos minutos)
```

Crea un balanceador de carga externo (cloud provider).

---

## Crear un Service

```bash
# Desde YAML
kubectl apply -f service.yaml

# Ver Services
kubectl get services

# Ver detalles
kubectl describe service nginx-service
```

---

## Service Discovery

Los Services tienen DNS automático:

```
<service-name>.<namespace>.svc.cluster.local
```

Ejemplo:
```
nginx-service.default.svc.cluster.local
```

O simplemente:
```
nginx-service
```

---

## Conectar Pods mediante Services

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: client-pod
spec:
  containers:
  - name: curl
    image: curlimages/curl
    command: ['sh', '-c', 'curl http://nginx-service']
```

---

## Verificar Conectividad

```bash
# Desde un Pod
kubectl exec -it client-pod -- curl http://nginx-service

# Ver endpoints del Service
kubectl get endpoints nginx-service
```

---

## Labels y Selectors

El Service selecciona Pods mediante **labels**:

```yaml
# Service
selector:
  app: nginx

# Deployment (debe coincidir)
labels:
  app: nginx
```

**Importante:** Los labels deben coincidir

---

## Múltiples Puertos

```yaml
apiVersion: v1
kind: Service
metadata:
  name: multi-port-service
spec:
  selector:
    app: myapp
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
```

---

## Headless Service

Para obtener IPs individuales de Pods:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-headless
spec:
  clusterIP: None
  selector:
    app: nginx
  ports:
  - port: 80
```

---

## Buenas Prácticas

✅ **Usa labels consistentes** entre Service y Pods

✅ **ClusterIP** para comunicación interna

✅ **NodePort** para desarrollo/testing

✅ **LoadBalancer** para producción en cloud

---

## Resumen

- **Service** expone Pods de forma estable
- **Tipos**: ClusterIP, NodePort, LoadBalancer
- **Service Discovery** mediante DNS
- **Balanceo de carga** automático
- **Labels** conectan Services con Pods

---

## ¿Preguntas?

**Siguiente módulo:** ConfigMaps y Secrets

