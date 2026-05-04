/**
 * LARIA G-MATRIX SERVICE
 * Centralizovaný prístup k dátam z Google Tabuľky (Čítanie aj Zápis)
 * Verzia: 2.0 (Bez no-cors, s detekciou odpovede)
 */

// Link na čítanie (Renderer)
const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbxBcijYrg4MZNwz8zP2Qi91rn-EgcFdG18b50HGc4_BhTnpe2paXqI6WiJP9NN5UenP/exec";

// Link na zápis (Tvoj VRÁTNIK 7.7) - Uisti sa, že je to tá najnovšia URL!
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbyr-Lus52rAlGwESkO4P9zgAaTDK7PVzoME5QIYCsqPpGgubUovlyx4ESAE94boqmgH/exec";

// 1. FUNKCIA NA ČÍTANIE DÁT
export const fetchGMatrix = async () => {
    try {
        const response = await fetch(G_MATRIX_READ_URL);
        if (!response.ok) throw new Error('Sieťová odozva nebola v poriadku');
        const data = await response.text();
        return data; 
    } catch (error) {
        console.error("❌ Chyba Matrixu pri čítaní:", error);
        return null;
    }
};

// 2. FUNKCIA NA ZÁPIS DÁT (Vrátnik)
export const saveToGMatrix = async (vizitkaData) => {
    try {
        console.log("📡 Odosielam dáta Vrátnikovi...");

        const response = await fetch(G_MATRIX_WRITE_URL, {
            method: 'POST',
            redirect: 'follow', // <--- TOTO TU MUSÍ BYŤ!
            headers: {
                // Používame text/plain, aby sme obišli zložité CORS vyjednávanie, 
                // Google Script si s tým poradí.
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(vizitkaData)
        });

        // Keďže už nemáme no-cors, môžeme prečítať odpoveď zo servera
        const result = await response.json();
        
        console.log("🚀 VRÁTNIK ODPOVEDÁ:", result);

        if (result.result === "success") {
            console.log("✅ Matrix úspešne aktualizovaný!");
            return { success: true, message: result.message, system: result.system };
        } else {
            console.error("⚠️ Vrátnik dáta odmietol:", result.message);
            return { success: false, error: result.message };
        }

    } catch (error) {
        // Tu konečne uvidíme reálnu chybu, ak napríklad zlyhá sieť alebo URL
        console.error("❌ Kritická chyba komunikácie s Matrixom:", error);
        return { success: false, error: error.message };
    }
};

export { G_MATRIX_READ_URL, G_MATRIX_WRITE_URL };