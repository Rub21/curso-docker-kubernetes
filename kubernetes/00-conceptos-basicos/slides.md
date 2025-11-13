---
marp: true
theme: default
paginate: true
header: '00 - Conceptos Básicos de Kubernetes'
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

# 00 - Conceptos Básicos de Kubernetes

**Fundamentos antes de empezar**

---

## Objetivo

Comprender los conceptos fundamentales de Kubernetes antes de empezar a trabajar con clusters.

---

## ¿Qué aprenderás?

- ¿Qué es Kubernetes y para qué sirve?
- Arquitectura de Kubernetes
- Conceptos fundamentales: Pod, Node, Cluster
- Componentes principales: API Server, etcd, kubelet
- Ventajas y casos de uso

---

## ¿Qué es Kubernetes?

Kubernetes (K8s) es una plataforma de **orquestación de contenedores** de código abierto.

**Orquestación** = Automatizar el despliegue, escalado y gestión de contenedores.

---

## ¿Por qué Kubernetes?

### Problemas que resuelve:

- **Escalado automático** de aplicaciones
- **Auto-recuperación** de contenedores fallidos
- **Balanceo de carga** automático
- **Gestión de actualizaciones** sin downtime
- **Despliegue en múltiples nodos**

---

## Arquitectura de Kubernetes

```
┌─────────────────────────────────────┐
│         Control Plane                │
│  (API Server, etcd, Scheduler)      │
└─────────────────────────────────────┘
              │
┌─────────────┴─────────────┐
│                           │
│    Worker Nodes           │
│  (kubelet, kube-proxy)    │
│                           │
└───────────────────────────┘
```

---

## Componentes del Control Plane

### API Server
- Punto de entrada para todas las operaciones
- Valida y procesa requests

### etcd
- Base de datos distribuida
- Almacena el estado del cluster

### Scheduler
- Asigna Pods a Nodes disponibles

---

## Componentes de los Worker Nodes

### kubelet
- Agente que corre en cada Node
- Asegura que los contenedores estén corriendo

### kube-proxy
- Maneja el networking del cluster
- Implementa Services

---

## Conceptos Fundamentales

### Pod
- **Unidad mínima** de despliegue en Kubernetes
- Contiene uno o más contenedores
- Comparten red y almacenamiento

### Node
- Máquina (física o virtual) que corre contenedores
- Puede ser Master o Worker

---

## Conceptos Fundamentales (cont.)

### Cluster
- Conjunto de Nodes que trabajan juntos
- Un Control Plane + múltiples Worker Nodes

### Namespace
- División lógica del cluster
- Permite organizar recursos

---

## Recursos de Kubernetes

### Deployments
- Gestiona réplicas de Pods
- Maneja actualizaciones y rollbacks

### Services
- Expone Pods de forma estable
- Proporciona balanceo de carga

---

## Recursos de Kubernetes (cont.)

### ConfigMaps
- Almacena configuración no sensible
- Separación de código y configuración

### Secrets
- Almacena datos sensibles
- Credenciales, tokens, etc.

---

## Ventajas de Kubernetes

✅ **Portabilidad**: Corre en cualquier cloud o on-premise

✅ **Escalabilidad**: Escala automáticamente según demanda

✅ **Resiliencia**: Auto-recuperación de fallos

✅ **Ecosistema**: Gran comunidad y herramientas

---

## Casos de Uso

- **Microservicios**: Orquestar múltiples servicios
- **CI/CD**: Desplegar aplicaciones automáticamente
- **Multi-cloud**: Distribuir carga entre clouds
- **Aplicaciones nativas en la nube**: Arquitecturas modernas

---

## Kubernetes vs Docker

| Docker | Kubernetes |
|--------|------------|
| Crea y ejecuta contenedores | Orquesta contenedores |
| Una máquina | Múltiples máquinas |
| Manual | Automático |
| Escala manualmente | Escala automáticamente |

**Son complementarios, no competidores**

---

## Herramientas Relacionadas

- **minikube**: Kubernetes local para desarrollo
- **kubectl**: CLI para interactuar con clusters
- **Helm**: Gestor de paquetes para Kubernetes
- **k9s**: Terminal UI para Kubernetes

---

## Próximos Pasos

En el siguiente módulo aprenderás a:
- Instalar kubectl
- Configurar un cluster local
- Crear tu primer Pod

---

## Resumen

- Kubernetes orquesta contenedores
- Arquitectura: Control Plane + Worker Nodes
- Conceptos clave: Pod, Node, Cluster
- Recursos: Deployments, Services, ConfigMaps, Secrets
- Herramientas: kubectl, minikube, Helm

---

## ¿Preguntas?

**Siguiente módulo:** Primer Pod

