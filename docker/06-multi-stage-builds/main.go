package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "<h1>¡Hola desde Multi-Stage Build con Go!</h1><p>Imagen optimizada con Go.</p>")
	})

	fmt.Println("Servidor Go escuchando en puerto 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

