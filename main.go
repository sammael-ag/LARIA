package main

import (
	"fmt"
	"net/http"
)

func main() {
	// Toto je náš prvý komunikačný kanál
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Nastavíme CORS, aby nám prehliadač nenadával (toto je dôležité!)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fmt.Fprintf(w, "Sammael, drak moj, som pripraveny! Laria Crystal dycha.")
	})

	port := ":8080"
	fmt.Println("-----------------------------------------")
	fmt.Println("🚀 LARIA NATIVE HELPER STARTUJE...")
	fmt.Println("📍 Pocuvam na adrese: http://localhost" + port)
	fmt.Println("-----------------------------------------")
	fmt.Println("Pripravujem sa na Proxy DNA a hardverove kúzla...")

	// Tu sa server nastartuje a zostane bezat
	err := http.ListenAndServe(port, nil)
	if err != nil {
		fmt.Println("Do rici, daco sa pokazilo:", err)
	}
}