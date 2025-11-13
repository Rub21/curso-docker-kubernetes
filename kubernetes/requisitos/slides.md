---
marp: true
theme: default
paginate: true
header: 'Requisitos del Curso'
footer: 'Curso de Kubernetes'
style: |
  section {
    font-size: 22px;
  }
  code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
  }
  pre {
    font-size: 16px;
  }
  /* Ajustar tamaño de iconos emoji */
  section :is(h1, h2, h3, p, li) {
    font-size: inherit;
  }
  section :is(h1, h2, h3, p, li)::before {
    font-size: 1em;
  }
---

# Requisitos del Curso de Kubernetes

**De Básico a Avanzado por Ruben Lopez Mendoza**

**Configuración inicial necesaria**

---

## Objetivo

Asegurarnos de que todos tengan el entorno correcto configurado antes de comenzar el curso.

---

## Prerrequisitos

Antes de comenzar, necesitas:

1. **Conocimientos básicos de Docker**
2. **kubectl** instalado
3. **minikube** instalado
4. **Extensiones de VS Code** (recomendadas)
5. **Verificar instalación**

---

## 1. Instalar kubectl

**kubectl** es la herramienta de línea de comandos para Kubernetes.

### macOS
```bash
brew install kubectl
```

### Linux
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### Windows
```powershell
choco install kubernetes-cli
```

### Verificar
```bash
kubectl version --client
```

---

## 2. Instalar minikube

**minikube** ejecuta Kubernetes localmente.

### macOS
```bash
brew install minikube
```

### Linux
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Windows
```powershell
choco install minikube
```

### Verificar
```bash
minikube version
```

---

## 3. Extensiones de VS Code

**Extensiones recomendadas para Kubernetes:**

1. **Kubernetes** (Microsoft)
   - Autocompletado de YAML
   - Navegación de recursos
   - Gestión de clusters

2. **YAML** (Red Hat)
   - Soporte mejorado para YAML
   - Validación de sintaxis
   - Formateo automático

---

## Instalar Extensiones

**Desde VS Code:**
1. Abre VS Code
2. Ve a Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Busca "Kubernetes"
4. Instala la extensión de Microsoft
5. Busca "YAML"
6. Instala la extensión de Red Hat

**O desde terminal:**
```bash
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
code --install-extension redhat.vscode-yaml
```

---

## 4. Iniciar minikube

```bash
# Iniciar cluster
minikube start

# Verificar estado
minikube status

# Verificar conexión
kubectl cluster-info
kubectl get nodes
```

**Nota:** La primera vez descarga la imagen de Kubernetes (~500MB)

---

## 5. Dashboard en Codespaces

En **GitHub Codespaces**, hacer port forwarding:

```bash
kubectl port-forward -n kubernetes-dashboard \
  svc/kubernetes-dashboard 8001:80
```

**Acceder al Dashboard:**

- **Local:** `http://localhost:8001`
- **Codespaces:** `https://[tu-codespace]-8001.app.github.dev`

**En VS Code (Codespaces):**
- Ve a la pestaña **"Ports"**
- Haz clic en el puerto 8001
- Selecciona **"Open in Browser"**

---

## Verificar Instalación

```bash
# 1. Verificar kubectl
kubectl version --client

# 2. Verificar minikube
minikube version

# 3. Iniciar cluster
minikube start

# 4. Verificar conexión
kubectl cluster-info
kubectl get nodes
```

---

## Resumen

✅ **kubectl** instalado

✅ **minikube** instalado

✅ **Extensiones de VS Code** instaladas

✅ **Cluster iniciado**

✅ **Conexión verificada**

**¡Estás listo para comenzar el curso!**

---

## Siguiente Paso

**Módulo siguiente:** 00 - Conceptos Básicos de Kubernetes
