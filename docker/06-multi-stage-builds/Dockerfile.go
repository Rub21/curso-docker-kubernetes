# Multi-stage para Go
# Etapa 1: Compilar
FROM golang:1.21 AS builder
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server main.go

# Etapa 2: Runtime mínimo
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]

