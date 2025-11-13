# Build stage
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim

# Crear usuario no-root
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1000 appuser

WORKDIR /app

# Copiar dependencias
COPY --from=builder /root/.local /root/.local

# Copiar aplicación
COPY --chown=appuser:appuser app.py .

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')"

# Cambiar a usuario no-root
USER appuser

ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000

CMD ["python", "app.py"]

