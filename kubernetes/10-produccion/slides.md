---
marp: true
theme: default
paginate: true
header: '10 - Producción'
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

# 10 - Producción

**Mejores prácticas para Kubernetes en producción**

---

## Objetivo

Aprender las mejores prácticas y consideraciones para ejecutar Kubernetes en producción de forma segura y eficiente.

---

## ¿Qué aprenderás?

- Seguridad en Kubernetes
- RBAC (Role-Based Access Control)
- Resource Limits y Requests
- Estrategias de despliegue
- Backup y Disaster Recovery
- Mejores prácticas generales

---

## Seguridad: Principios Básicos

✅ **Principio de menor privilegio**
- Solo permisos necesarios
- No usar root en contenedores

✅ **Defensa en profundidad**
- Múltiples capas de seguridad
- No confiar en una sola medida

✅ **Actualizaciones regulares**
- Parches de seguridad
- Versiones soportadas

---

## RBAC: Roles y RoleBindings

### Crear Role

```yaml
apiVersion: rbac.authorization.k8s.io/v1  # Versión de la API para RBAC
kind: Role  # Tipo de recurso: Role (permisos a nivel de namespace)
metadata:   # Metadatos del Role
  name: pod-reader  # Nombre del Role
  namespace: default  # Namespace al que aplica este Role
    # Los permisos de este Role solo aplican al namespace "default"
spec:       # Especificación del Role
  rules:    # Lista de reglas de permisos
  - apiGroups: [""]  # Grupo de API ("" = core API group, v1)
    resources: ["pods"]  # Recursos sobre los que aplica (pods)
    verbs: ["get", "watch", "list"]  # Acciones permitidas
      # get = leer un recurso específico, watch = observar cambios, list = listar recursos
      # Otros verbs: create, update, patch, delete
      # Este Role permite leer Pods pero NO crearlos, actualizarlos o eliminarlos
```

---

## RBAC: RoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1  # Versión de la API para RBAC
kind: RoleBinding  # Tipo de recurso: RoleBinding (asigna Role a subjects)
metadata:           # Metadatos del RoleBinding
  name: read-pods   # Nombre del RoleBinding
  namespace: default  # Namespace al que aplica (debe coincidir con el Role)
spec:               # Especificación del RoleBinding
  subjects:         # Lista de subjects (quién recibe los permisos)
  - kind: User      # Tipo de subject: User (usuario)
    name: jane       # Nombre del usuario
    apiGroup: rbac.authorization.k8s.io  # Grupo de API para RBAC
    # Otros tipos: Group (grupo de usuarios), ServiceAccount (cuenta de servicio)
  roleRef:          # Referencia al Role a asignar
    kind: Role      # Tipo de recurso: Role
    name: pod-reader  # Nombre del Role (debe existir en el mismo namespace)
    apiGroup: rbac.authorization.k8s.io  # Grupo de API para RBAC
    # Este RoleBinding asigna el Role "pod-reader" al usuario "jane"
```

---

## RBAC: ClusterRole y ClusterRoleBinding

Para permisos a nivel de cluster:

```yaml
apiVersion: rbac.authorization.k8s.io/v1  # Versión de la API para RBAC
kind: ClusterRole  # Tipo de recurso: ClusterRole (permisos a nivel de cluster)
metadata:           # Metadatos del ClusterRole
  name: cluster-admin  # Nombre del ClusterRole
  # No tiene namespace porque aplica a todo el cluster
spec:               # Especificación del ClusterRole
  rules:            # Lista de reglas de permisos
  - apiGroups: [""]  # Grupo de API ("" = core API group)
    resources: ["*"]  # Todos los recursos (wildcard)
    verbs: ["*"]      # Todas las acciones (wildcard)
      # Este ClusterRole da permisos completos sobre todos los recursos
      # ⚠️ CUIDADO: Solo asignar a usuarios de confianza
      # En producción, usa permisos más restrictivos (principio de menor privilegio)
```

---

## Resource Limits y Requests

### Requests
- Recursos garantizados
- Kubernetes reserva estos recursos

### Limits
- Máximo de recursos
- Contenedor será throttled si excede

---

## Ejemplo: Resource Limits

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    resources:   # Configuración de recursos
      requests:  # Recursos solicitados (garantizados por Kubernetes)
        memory: "256Mi"  # Memoria solicitada (256 Mebibytes)
          # Kubernetes reserva esta cantidad de memoria para el contenedor
          # Se usa para scheduling (decidir en qué Node colocar el Pod)
        cpu: "250m"      # CPU solicitada (250 millicores = 0.25 cores)
          # 250m = 0.25 cores, 1000m = 1 core
      limits:    # Límites máximos (no se puede exceder)
        memory: "512Mi"  # Límite máximo de memoria (512 Mebibytes)
          # Si el contenedor intenta usar más, será terminado (OOMKilled)
        cpu: "500m"      # Límite máximo de CPU (500 millicores = 0.5 cores)
          # Si el contenedor intenta usar más, será throttled (ralentizado)
          # ⚠️ IMPORTANTE: Siempre define requests y limits en producción
```

---

## Estrategias de Despliegue

### Rolling Update (default)
- Actualiza gradualmente
- Sin downtime
- Permite rollback

### Blue/Green
- Dos versiones completas
- Switch instantáneo
- Rollback fácil

---

## Estrategias de Despliegue (cont.)

### Canary
- Despliega nueva versión a pequeño porcentaje
- Monitorea y expande gradualmente
- Rollback rápido si hay problemas

### Recreate
- Elimina todo y recrea
- Tiene downtime
- Solo para casos especiales

---

## Implementar Canary con Istio

```yaml
apiVersion: networking.istio.io/v1alpha3  # Versión de la API de Istio
kind: VirtualService  # Tipo de recurso: VirtualService (routing de Istio)
metadata:              # Metadatos del VirtualService
  name: canary         # Nombre del VirtualService
spec:                  # Especificación del VirtualService
  hosts:               # Hosts a los que aplica este VirtualService
  - myapp               # Nombre del Service (debe existir)
    # Este VirtualService controla el routing para el Service "myapp"
  http:                 # Configuración de routing HTTP
  # Primera regla: Routing basado en headers (para testing manual)
  - match:              # Condición de coincidencia
    - headers:          # Coincidencia basada en headers HTTP
        canary:         # Header HTTP llamado "canary"
          exact: "true" # Valor exacto "true"
          # Si el request tiene header "canary: true", se enruta a v2
          # Útil para testing: curl -H "canary: true" http://myapp
    route:              # Reglas de routing cuando hay coincidencia
    - destination:      # Destino del routing
        host: myapp     # Service de destino
        subset: v2     # Subset (versión) v2 (nueva versión)
          # Los subsets se definen en DestinationRule de Istio
      weight: 100       # 100% del tráfico con este header va a v2
  # Segunda regla: Routing por peso (para canary automático)
  - route:              # Reglas de routing (sin match = aplica a todo el tráfico restante)
    - destination:      # Primer destino
        host: myapp     # Service de destino
        subset: v1      # Subset v1 (versión actual/estable)
      weight: 90        # 90% del tráfico va a v1 (versión estable)
    - destination:      # Segundo destino
        host: myapp     # Service de destino
        subset: v2      # Subset v2 (nueva versión)
      weight: 10        # 10% del tráfico va a v2 (nueva versión)
        # Flujo típico: 1) Despliega v2 con 10% tráfico, 2) Monitorea métricas
        # 3) Si todo va bien, aumenta a 25%, 50%, 100%, 4) Si hay problemas, rollback
        # Nota: Requiere DestinationRule de Istio para definir los subsets v1 y v2
```

---

## Backup y Disaster Recovery

### Velero (anteriormente Heptio Ark)

```bash
# Instalar Velero
velero install \
  --provider aws \
  --bucket my-backup-bucket \
  --secret-file ./credentials-velero

# Crear backup
velero backup create my-backup

# Restaurar
velero restore create --from-backup my-backup
```

---

## Backup: Recursos Críticos

Backup regular de:
- **ConfigMaps y Secrets**
- **PersistentVolumes**
- **Deployments y Services**
- **Ingress rules**

**No olvides:** Datos de aplicaciones (bases de datos)

---

## Network Policies

Aísla tráfico entre Pods:

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para NetworkPolicies
kind: NetworkPolicy  # Tipo de recurso: NetworkPolicy (controla tráfico de red)
metadata:              # Metadatos del NetworkPolicy
  name: deny-all       # Nombre del NetworkPolicy
spec:                  # Especificación del NetworkPolicy
  podSelector: {}      # Selector de Pods (vacío = todos los Pods en el namespace)
    # Aplica a todos los Pods en el namespace
    # Si especificas labels, solo aplica a Pods con esos labels
  policyTypes:         # Tipos de políticas
  - Ingress            # Política de tráfico entrante (bloquea todo el tráfico entrante)
  - Egress             # Política de tráfico saliente (bloquea todo el tráfico saliente)
    # Esta NetworkPolicy bloquea TODO el tráfico (entrante y saliente)
    # Útil como política base: primero bloquea todo, luego permite específicamente lo necesario
    # ⚠️ CUIDADO: Esto puede romper aplicaciones si no configuras reglas de permitir después
```

---

## Network Policy: Permitir Tráfico

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para NetworkPolicies
kind: NetworkPolicy  # Tipo de recurso: NetworkPolicy
metadata:              # Metadatos del NetworkPolicy
  name: allow-frontend  # Nombre del NetworkPolicy
spec:                  # Especificación del NetworkPolicy
  podSelector:         # Selector de Pods a los que aplica esta política
    matchLabels:       # Labels que deben coincidir
      app: frontend    # Solo aplica a Pods con label app: frontend
      # Esta política protege los Pods de frontend
  ingress:             # Reglas de tráfico entrante (qué tráfico permitir)
  - from:              # Fuentes permitidas
    - podSelector:     # Permite tráfico desde Pods con estos labels
        matchLabels:   # Labels que deben tener los Pods fuente
          app: backend # Solo permite tráfico desde Pods con app: backend
        # Frontend solo puede recibir tráfico desde backend
    ports:             # Puertos permitidos
    - protocol: TCP    # Protocolo: TCP
      port: 8080       # Puerto 8080
        # Solo permite tráfico TCP en puerto 8080
        # Otros puertos y protocolos están bloqueados
```

---

## Pod Security Standards

### Privileged
- Sin restricciones
- No recomendado

### Baseline
- Restricciones mínimas
- Prevenir escalada de privilegios

### Restricted
- Restricciones más estrictas
- Máxima seguridad

---

## Mejores Prácticas: Imágenes

✅ **Usa imágenes oficiales** o de confianza

✅ **Escanea imágenes** por vulnerabilidades

✅ **Usa tags específicos** (no `latest`)

✅ **Mantén imágenes actualizadas**

✅ **Usa imágenes minimalistas** (Alpine, distroless)

---

## Mejores Prácticas: Configuración

✅ **Usa ConfigMaps** para configuración

✅ **Usa Secrets** para datos sensibles

✅ **No hardcodees** configuración en imágenes

✅ **Usa variables de entorno** cuando sea posible

✅ **Versiona configuración** con Git

---

## Mejores Prácticas: Recursos

✅ **Define Requests y Limits** siempre

✅ **Usa ResourceQuotas** por Namespace

✅ **Monitorea uso de recursos**

✅ **Ajusta según métricas reales**

✅ **Evita over-provisioning**

---

## Mejores Prácticas: Despliegues

✅ **Usa Deployments** (no Pods directos)

✅ **Implementa healthchecks** (Liveness, Readiness)

✅ **Usa rolling updates** para producción

✅ **Prueba rollback** regularmente

✅ **Monitorea durante despliegues**

---

## Checklist de Producción

- [ ] RBAC configurado
- [ ] Resource Limits definidos
- [ ] Healthchecks implementados
- [ ] Secrets gestionados correctamente
- [ ] Backup configurado
- [ ] Monitoreo activo
- [ ] Logs centralizados
- [ ] Network Policies aplicadas
- [ ] Actualizaciones planificadas
- [ ] Documentación actualizada

---

## Resumen

- **Seguridad**: RBAC, Network Policies, Pod Security
- **Recursos**: Requests y Limits siempre
- **Despliegues**: Rolling updates, Canary, Blue/Green
- **Backup**: Velero para disaster recovery
- **Monitoreo**: Métricas, logs, alertas
- **Mejores prácticas**: Imágenes, configuración, recursos

---

## ¡Felicidades!

Has completado el curso de Kubernetes de básico a avanzado.

**Próximos pasos:**
- Practica con proyectos reales
- Explora herramientas avanzadas (Istio, ArgoCD)
- Certifícate (CKA, CKAD)
- Únete a la comunidad

---

## ¿Preguntas?

**¡Gracias por completar el curso!** ☸️

