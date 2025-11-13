---
marp: true
theme: default
paginate: true
header: '04 - ConfigMaps y Secrets'
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

# 04 - ConfigMaps y Secrets

**Gestionar configuración y datos sensibles**

---

## Objetivo

Aprender a usar ConfigMaps y Secrets para gestionar configuración y datos sensibles en Kubernetes.

---

## ¿Qué aprenderás?

- ¿Qué son ConfigMaps y Secrets?
- Crear ConfigMaps
- Crear Secrets
- Usar ConfigMaps y Secrets en Pods
- Mejores prácticas de seguridad

---

## Problema: Configuración Hardcodeada

❌ Configuración hardcodeada en imágenes:
- Dificulta cambios sin rebuild
- No permite diferentes configs por ambiente
- Datos sensibles expuestos en código

**Solución:** ConfigMaps y Secrets

---

## ConfigMap

Un **ConfigMap** almacena datos de configuración **no sensibles**.

- Variables de entorno
- Archivos de configuración
- Parámetros de aplicación

---

## Crear ConfigMap

### Opción 1: Desde archivo

```bash
kubectl create configmap app-config \
  --from-file=config.properties
```

### Opción 2: Desde literal

```bash
kubectl create configmap app-config \
  --from-literal=key1=value1 \
  --from-literal=key2=value2
```

---

## Crear ConfigMap desde YAML

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: ConfigMap  # Tipo de recurso: ConfigMap (configuración no sensible)
metadata:        # Metadatos del ConfigMap
  name: app-config  # Nombre del ConfigMap (se usa para referenciarlo en Pods)
data:            # Datos del ConfigMap (pares clave-valor)
  # Valores simples (variables de entorno)
  database_url: "postgresql://localhost:5432/mydb"  # URL de base de datos
  log_level: "info"  # Nivel de logging
  # Archivo completo (usando | para multi-línea)
  config.properties: |  # Nombre del archivo (se creará como archivo cuando se monte)
    server.port=8080    # Contenido del archivo (línea 1)
    server.host=0.0.0.0  # Contenido del archivo (línea 2)
```

---

## Usar ConfigMap en Pod

### Como variables de entorno

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    envFrom:      # Carga TODAS las claves del ConfigMap como variables de entorno
    - configMapRef:  # Referencia al ConfigMap
        name: app-config  # Nombre del ConfigMap a usar
        # Nota: Cada clave del ConfigMap se convierte en una variable de entorno
```

---

## Usar ConfigMap en Pod (cont.)

### Como archivo montado

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    volumeMounts:  # Monta volúmenes en el contenedor
    - name: config-volume  # Nombre del volumen (debe coincidir con volumes)
      mountPath: /etc/config  # Dónde se monta en el contenedor
      # Cada clave del ConfigMap se crea como archivo aquí
  volumes:      # Define los volúmenes a montar
  - name: config-volume  # Nombre del volumen
    configMap:  # Volumen desde ConfigMap
      name: app-config  # Nombre del ConfigMap a montar
```

---

## Secret

Un **Secret** almacena datos **sensibles**.

- Contraseñas
- Tokens
- Claves API
- Certificados

---

## Crear Secret

### Opción 1: Desde archivo

```bash
kubectl create secret generic app-secret \
  --from-file=password.txt
```

### Opción 2: Desde literal

```bash
kubectl create secret generic app-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123
```

---

## Crear Secret desde YAML

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Secret    # Tipo de recurso: Secret (datos sensibles)
metadata:       # Metadatos del Secret
  name: app-secret  # Nombre del Secret
type: Opaque    # Tipo de Secret (Opaque = datos arbitrarios, es el más común)
data:           # Datos del Secret (valores en base64)
  # ⚠️ Los valores DEBEN estar en base64
  # Para codificar: echo -n "admin" | base64
  username: YWRtaW4=  # base64 de "admin"
  password: c2VjcmV0MTIz  # base64 de "secret123"
  # ⚠️ NOTA: Base64 NO es encriptación, cualquiera puede decodificar
```

**Nota:** Los valores deben estar en base64

---

## Codificar en Base64

```bash
# Codificar
echo -n "admin" | base64
# Resultado: YWRtaW4=

# Decodificar
echo "YWRtaW4=" | base64 -d
# Resultado: admin
```

---

## Usar Secret en Pod

### Como variables de entorno

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    env:          # Variables de entorno individuales
    - name: DB_PASSWORD  # Nombre de la variable de entorno en el Pod
      valueFrom:  # Obtiene el valor de un recurso externo
        secretKeyRef:  # Referencia a una clave específica del Secret
          name: app-secret  # Nombre del Secret
          key: password     # Clave del Secret a usar
          # El valor se decodifica automáticamente (de base64 a texto)
```

---

## Usar Secret en Pod (cont.)

### Como archivo montado

```yaml
apiVersion: v1  # Versión de la API de Kubernetes
kind: Pod       # Tipo de recurso: Pod
spec:           # Especificación del Pod
  containers:   # Lista de contenedores
  - name: app     # Nombre del contenedor
    image: myapp:latest  # Imagen de la aplicación
    volumeMounts:  # Monta volúmenes en el contenedor
    - name: secret-volume  # Nombre del volumen (debe coincidir con volumes)
      mountPath: /etc/secrets  # Dónde se monta en el contenedor
      readOnly: true  # Solo lectura (recomendado para Secrets)
      # Cada clave del Secret se crea como archivo aquí
  volumes:      # Define los volúmenes a montar
  - name: secret-volume  # Nombre del volumen
    secret:     # Volumen desde Secret
      secretName: app-secret  # Nombre del Secret a montar
```

---

## Tipos de Secrets

- **Opaque**: Datos arbitrarios (default)
- **kubernetes.io/dockerconfigjson**: Credenciales Docker
- **kubernetes.io/tls**: Certificados TLS
- **kubernetes.io/service-account-token**: Tokens de Service Account

---

## Ver ConfigMaps y Secrets

```bash
# Ver ConfigMaps
kubectl get configmaps
kubectl describe configmap app-config

# Ver Secrets
kubectl get secrets
kubectl describe secret app-secret

# Ver contenido (decodificado)
kubectl get secret app-secret -o jsonpath='{.data.password}' | base64 -d
```

---

## Buenas Prácticas

✅ **ConfigMaps** para configuración no sensible

✅ **Secrets** para datos sensibles

✅ **No commitees Secrets** en Git

✅ **Usa herramientas externas** para Secrets en producción (Vault, etc.)

✅ **Monta Secrets como read-only**

---

## Seguridad de Secrets

⚠️ **Los Secrets NO están encriptados por defecto**

- Se almacenan en etcd en base64 (no encriptado)
- Cualquiera con acceso a etcd puede leerlos
- En producción, usa encriptación de etcd

---

## Resumen

- **ConfigMap** = Configuración no sensible
- **Secret** = Datos sensibles (base64)
- Se pueden usar como **variables de entorno** o **archivos montados**
- **No commitees Secrets** en Git
- En producción, considera herramientas externas

---

## ¿Preguntas?

**Siguiente módulo:** Volúmenes Persistentes

