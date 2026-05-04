/**
 * LARIA G-MATRIX SERVICE
 * Centralizovaný prístup k dátam z Google Tabuľky (Čítanie aj Zápis)
 */

// Link na čítanie (CSV)
const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbxBcijYrg4MZNwz8zP2Qi91rn-EgcFdG18b50HGc4_BhTnpe2paXqI6WiJP9NN5UenP/exec";

// Link na zápis (Tvoj LARIA Bot)
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbxubEzcknytR16HECxr716A8c3cjABLalg1SIebavwHeL6hnFXe47K7QqvpNaSR_uC1/exec";

// FUNKCIA NA ČÍTANIE DÁT
export const fetchGMatrix = async () => {
    try {
        const response = await fetch(G_MATRIX_READ_URL);
        if (!response.ok) throw new Error('Sieťová odozva nebola v poriadku');
        const data = await response.text();
        return data; 
    } catch (error) {
        console.error("Chyba LARIA Matrix pripojenia (čítanie):", error);
        return null;
    }
};

// FUNKCIA NA ZÁPIS DÁT (Botov „Vrátnik“)
export const saveToGMatrix = async (vizitkaData) => {
    try {
        const response = await fetch(G_MATRIX_WRITE_URL, {
            method: 'POST',
            mode: 'no-cors', // Dôležité pre Google Apps Script
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vizitkaData)
        });
        
        console.log("Dáta odoslané do Matrixu!");
        return { success: true };
    } catch (error) {
        console.error("Chyba LARIA Matrix zápisu:", error);
        return { success: false, error };
    }
};

export { G_MATRIX_READ_URL, G_MATRIX_WRITE_URL };