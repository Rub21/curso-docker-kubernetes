---
marp: true
theme: default
paginate: true
header: '06 - Ingress'
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

# 06 - Ingress

**Exponer servicios HTTP/HTTPS externamente**

---

## Objetivo

Aprender a usar Ingress para exponer servicios HTTP/HTTPS de forma inteligente con routing basado en rutas.

---

## ¿Qué aprenderás?

- ¿Qué es Ingress?
- Ingress Controllers
- Crear recursos Ingress
- Routing basado en rutas
- TLS/SSL con Ingress
- Annotations comunes

---

## Limitaciones de NodePort y LoadBalancer

❌ **NodePort**: Expone un puerto en cada Node
- Requiere conocer la IP del Node
- No hay routing basado en rutas
- No hay terminación SSL centralizada

❌ **LoadBalancer**: Un balanceador por Service
- Costoso (un LB por Service)
- No hay routing basado en rutas

**Solución:** Ingress

---

## ¿Qué es Ingress?

**Ingress** expone servicios HTTP/HTTPS externamente con:
- ✅ Routing basado en rutas
- ✅ Terminación SSL/TLS
- ✅ Un solo punto de entrada
- ✅ Reglas de routing flexibles

---

## Ingress Controller

Un **Ingress Controller** es necesario para que Ingress funcione.

- Implementa las reglas de Ingress
- Ejemplos: Nginx, Traefik, Istio
- Debe estar instalado en el cluster

---

## Ingress vs Service

| Service | Ingress |
|---------|---------|
| L4 (TCP/UDP) | L7 (HTTP/HTTPS) |
| Balanceo simple | Routing inteligente |
| Un Service = Un endpoint | Múltiples rutas = Un endpoint |

---

## Crear Ingress Básico

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress (networking.k8s.io/v1 es la versión estable)
kind: Ingress                      # Tipo de recurso: Ingress (routing HTTP/HTTPS)
metadata:                          # Metadatos del Ingress
  name: example-ingress            # Nombre del Ingress (debe ser único en el namespace)
spec:                              # Especificación del Ingress
  rules:                           # Lista de reglas de routing (cada regla define cómo enrutar tráfico)
  - host: example.com              # Dominio que coincide con esta regla (opcional, si no especificas aplica a todos los hosts)
    http:                          # Configuración HTTP para este host
      paths:                       # Lista de rutas (paths) para este host
      - path: /                    # Ruta que coincide (en este caso, la ruta raíz)
        pathType: Prefix           # Tipo de coincidencia: Prefix (coincide con prefijo)
        # Prefix = / coincide con /, /api, /users, etc.
        # Otros tipos: Exact (coincidencia exacta), ImplementationSpecific
        backend:                   # Service al que enrutar cuando hay coincidencia
          service:                 # Referencia al Service
            name: web-service      # Nombre del Service (debe existir en el mismo namespace)
            port:                  # Puerto del Service
              number: 80           # Número del puerto del Service
              # El Ingress Controller enruta tráfico a este Service cuando hay coincidencia
```

---

## Routing Basado en Rutas

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress
kind: Ingress                      # Tipo de recurso: Ingress
metadata:                          # Metadatos del Ingress
  name: path-based-ingress         # Nombre del Ingress
spec:                              # Especificación del Ingress
  rules:                           # Lista de reglas de routing
  - host: example.com              # Dominio para estas rutas
    http:                          # Configuración HTTP
      paths:                       # Lista de rutas (orden importa: más específicas primero)
      - path: /api                 # Primera ruta: /api y todo lo que empiece con /api
        pathType: Prefix           # Tipo: Prefix (coincide con /api, /api/v1, /api/users, etc.)
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: api-service      # Service para la API (debe existir)
            port:                  # Puerto del Service
              number: 80           # Puerto 80 del api-service
              # Requests a /api/* se enrutan a api-service:80
      - path: /web                 # Segunda ruta: /web y todo lo que empiece con /web
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: web-service      # Service para la aplicación web (debe existir)
            port:                  # Puerto del Service
              number: 80           # Puerto 80 del web-service
              # Requests a /web/* se enrutan a web-service:80
              # Nota: El orden importa - las rutas más específicas deben ir primero
```

---

## Tipos de Path

### Exact
- Coincidencia exacta
- `/api/v1` solo coincide con `/api/v1`

### Prefix
- Coincidencia por prefijo
- `/api` coincide con `/api`, `/api/v1`, etc.

### ImplementationSpecific
- Depende del Ingress Controller

---

## Múltiples Hosts

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress
kind: Ingress                      # Tipo de recurso: Ingress
metadata:                          # Metadatos del Ingress
  name: multi-host-ingress         # Nombre del Ingress
spec:                              # Especificación del Ingress
  rules:                           # Lista de reglas (cada regla puede tener un host diferente)
  - host: api.example.com          # Primer dominio: API
    http:                          # Configuración HTTP para este host
      paths:                       # Rutas para este host
      - path: /                    # Ruta raíz
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: api-service      # Service de la API
            port:                  # Puerto del Service
              number: 80           # Puerto 80
              # Requests a api.example.com/* se enrutan a api-service:80
  - host: web.example.com          # Segundo dominio: Web
    http:                          # Configuración HTTP para este host
      paths:                       # Rutas para este host
      - path: /                    # Ruta raíz
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: web-service      # Service de la aplicación web
            port:                  # Puerto del Service
              number: 80           # Puerto 80
              # Requests a web.example.com/* se enrutan a web-service:80
              # Nota: Debes configurar DNS para que estos dominios apunten al LoadBalancer del Ingress Controller
```

---

## TLS/SSL con Ingress

### Paso 1: Crear Secret con certificado

```bash
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key
```

### Paso 2: Referenciar en Ingress

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress
kind: Ingress                      # Tipo de recurso: Ingress
metadata:                          # Metadatos del Ingress
  name: tls-ingress                # Nombre del Ingress
spec:                              # Especificación del Ingress
  tls:                             # Configuración TLS/SSL
  - hosts:                         # Lista de hosts para este certificado
    - example.com                  # Dominio que usará este certificado
    secretName: tls-secret         # Nombre del Secret que contiene el certificado
      # El Secret debe ser de tipo "kubernetes.io/tls"
      # Contiene: tls.crt (certificado) y tls.key (clave privada)
      # Crear con: kubectl create secret tls tls-secret --cert=tls.crt --key=tls.key
  rules:                           # Reglas de routing (igual que sin TLS)
  - host: example.com              # Dominio (debe coincidir con el host en tls)
    http:                          # Configuración HTTP
      paths:                       # Rutas
      - path: /                    # Ruta raíz
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: web-service      # Service
            port:                  # Puerto del Service
              number: 80           # Puerto 80
              # El Ingress Controller termina SSL/TLS y envía HTTP al Service
              # Cliente → HTTPS → Ingress (descifra) → HTTP → Service → Pods
```

---

## Cert-Manager (Automático)

**cert-manager** gestiona certificados automáticamente:

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress
kind: Ingress                      # Tipo de recurso: Ingress
metadata:                          # Metadatos del Ingress
  name: cert-manager-ingress       # Nombre del Ingress
  annotations:                     # Anotaciones específicas del Ingress Controller
    cert-manager.io/cluster-issuer: "letsencrypt-prod"  # ClusterIssuer de cert-manager
      # cert-manager detecta esta anotación y solicita certificado automáticamente
      # "letsencrypt-prod" debe ser un ClusterIssuer configurado en el cluster
      # Let's Encrypt es gratuito y renovación automática
spec:                              # Especificación del Ingress
  tls:                             # Configuración TLS/SSL
  - hosts:                         # Lista de hosts para este certificado
    - example.com                  # Dominio que usará este certificado
    secretName: example-com-tls    # Nombre del Secret donde cert-manager guardará el certificado
      # cert-manager crea este Secret automáticamente con el certificado
      # No necesitas crear el Secret manualmente
  rules:                           # Reglas de routing
  - host: example.com              # Dominio (debe coincidir con el host en tls)
    http:                          # Configuración HTTP
      paths:                       # Rutas
      - path: /                    # Ruta raíz
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: web-service      # Service
            port:                  # Puerto del Service
              number: 80           # Puerto 80
              # Flujo: cert-manager detecta anotación → solicita certificado → crea Secret → Ingress usa certificado
              # Renovación automática antes de expirar
```

---

## Annotations Comunes (Nginx)

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress
kind: Ingress                      # Tipo de recurso: Ingress
metadata:                          # Metadatos del Ingress
  name: nginx-ingress              # Nombre del Ingress
  annotations:                     # Anotaciones específicas del Nginx Ingress Controller
    nginx.ingress.kubernetes.io/rewrite-target: /  # Reescribe la URL antes de enviar al Service
      # Útil cuando el Service espera una ruta diferente
      # Ejemplo: /api/users → reescribe a / → Service recibe /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"  # Redirige HTTP a HTTPS automáticamente
      # Si alguien accede vía HTTP, redirige a HTTPS
      # Útil para forzar HTTPS
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"  # Fuerza redirección a HTTPS
      # Similar a ssl-redirect pero más estricto
      # Redirige incluso si no hay certificado configurado
      # Útil para desarrollo/testing
      # Otras annotations útiles:
      # - nginx.ingress.kubernetes.io/rate-limit: "100" (limitar requests)
      # - nginx.ingress.kubernetes.io/cors-allow-origin: "*" (CORS)
      # - nginx.ingress.kubernetes.io/auth-type: "basic" (autenticación)
spec:                              # Especificación del Ingress
  rules:                           # Reglas de routing
  - host: example.com              # Dominio
    http:                          # Configuración HTTP
      paths:                       # Rutas
      - path: /                    # Ruta raíz
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: web-service      # Service
            port:                  # Puerto del Service
              number: 80           # Puerto 80
              # Nota: Revisa la documentación de tu Ingress Controller para annotations disponibles
```

---

## Verificar Ingress

```bash
# Ver Ingress
kubectl get ingress

# Ver detalles
kubectl describe ingress example-ingress

# Ver en formato YAML
kubectl get ingress example-ingress -o yaml
```

---

## Ingress Controller: Nginx

### Instalar (usando Helm)

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx
```

### Verificar instalación

```bash
kubectl get pods -n ingress-nginx
kubectl get service ingress-nginx-controller
```

---

## Default Backend

```yaml
apiVersion: networking.k8s.io/v1  # Versión de la API para Ingress
kind: Ingress                      # Tipo de recurso: Ingress
metadata:                          # Metadatos del Ingress
  name: default-backend-ingress   # Nombre del Ingress
spec:                              # Especificación del Ingress
  defaultBackend:                  # Service por defecto (cuando no hay coincidencia)
    service:                       # Referencia al Service
      name: default-service        # Service que maneja rutas no encontradas
      port:                        # Puerto del Service
        number: 80                 # Puerto 80
        # Este Service se usa cuando:
        # - Request no coincide con ninguna regla
        # - Útil para mostrar página 404 personalizada
        # - Útil para logging de requests no encontrados
  rules:                           # Reglas de routing
  - host: example.com              # Dominio
    http:                          # Configuración HTTP
      paths:                       # Rutas
      - path: /                    # Ruta raíz
        pathType: Prefix           # Tipo: Prefix
        backend:                   # Service al que enrutar
          service:                 # Referencia al Service
            name: web-service      # Service principal
            port:                  # Puerto del Service
              number: 80           # Puerto 80
              # Flujo: Request a / → web-service, Request a /unknown → default-service
```

---

## Buenas Prácticas

✅ **Usa Ingress** para aplicaciones HTTP/HTTPS

✅ **Configura TLS** para producción

✅ **Usa cert-manager** para certificados automáticos

✅ **Revisa annotations** de tu Ingress Controller

✅ **Considera rate limiting** para APIs

---

## Resumen

- **Ingress** = Routing HTTP/HTTPS inteligente
- **Ingress Controller** = Implementa las reglas
- **Routing basado en rutas** y hosts
- **TLS/SSL** con Secrets o cert-manager
- **Annotations** para configuración avanzada

---

## ¿Preguntas?

**Siguiente módulo:** Namespaces

