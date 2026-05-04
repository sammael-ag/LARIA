/**
 * LARIA G-MATRIX SERVICE
 * Centralizovaný prístup k dátam z Google Tabuľky (Čítanie aj Zápis)
 * Verzia: 2.2 (The Cache Breaker - s elimináciou Google Cache)
 */

// Link na čítanie (Renderer)
const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

// Link na zápis (Tvoj VRÁTNIK 7.9 TEST IDENTITA)
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbyD0INZlUfMJaBYFp8Q9ndgi9gQqYjPPyql9BjmulvvoF6LU6HLLP6gTRHHbrHbgZt6/exec";

// 1. FUNKCIA NA ČÍTANIE DÁT
export const fetchGMatrix = async () => {
    try {
        // Aj tu pridáme náhodné číslo, aby sme čítali VŽDY čerstvý Matrix
        const response = await fetch(`${G_MATRIX_READ_URL}?v=${Date.now()}`);
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
        // Vytvoríme unikátnu URL pre tento konkrétny pokus
        const uniqueWriteUrl = `${G_MATRIX_WRITE_URL}?nocache=${Date.now()}`;
        
        console.log("🎯 REÁLNY CIEĽ STREĽBY:", uniqueWriteUrl);
        console.log("📡 Odosielam balík Vrátnikovi...");

        const response = await fetch(uniqueWriteUrl, {
            method: 'POST',
            mode: 'cors', 
            redirect: 'follow', 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(vizitkaData)
        });

        const result = await response.json();
        
        console.log("🚀 VRÁTNIK ODPOVEDÁ:", result);

        if (result.result === "success") {
            console.log("✅ Matrix úspešne aktualizovaný!");
            return { success: true, message: result.message, system: result.system };
        } else {
            console.warn("⚠️ Vrátnik dáta odmietol:", result.message);
            return { success: false, error: result.message, system: result.system };
        }

    } catch (error) {
        console.error("❌ Kritická chyba komunikácie s Matrixom:", error);
        return { success: false, error: error.message };
    }
};

export { G_MATRIX_READ_URL, G_MATRIX_WRITE_URL };