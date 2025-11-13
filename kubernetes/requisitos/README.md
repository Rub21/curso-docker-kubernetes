# Requisitos del Curso de Kubernetes

Este módulo cubre los requisitos esenciales para comenzar el curso de Kubernetes.

## 📚 Contenido

- Instalación de kubectl
- Instalación de minikube
- Iniciar cluster local
- Verificación de instalación
- Dashboard en Codespaces

## 🎯 Objetivos de Aprendizaje

Al finalizar este módulo, serás capaz de:

- Instalar kubectl y minikube
- Iniciar un cluster de Kubernetes local
- Verificar que todo esté funcionando correctamente

## 🛠️ Instalación Rápida

### kubectl

**macOS:**
```bash
brew install kubectl
```

**Linux:**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### minikube

**macOS:**
```bash
brew install minikube
```

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## ✅ Verificación

```bash
kubectl version --client
minikube version
minikube start
kubectl cluster-info
kubectl get nodes
```

## 📖 Recursos

- **Slides**: `slides.md`
- **Notas de Orador**: `speaker-notes.md`

## 🔗 Siguiente Módulo

[00 - Conceptos Básicos](../00-conceptos-basicos/README.md)
