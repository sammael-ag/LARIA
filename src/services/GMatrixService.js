/**
 * LARIA G-MATRIX SERVICE
 * Centralizovaný prístup k dátam z Google Tabuľky
 */

const G_MATRIX_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9Bm2VWW_1OHAct7kfVOJd9x-FAQWVgKSJrfbisueLmhEcoxPD66V40pemwGiN4MqG5JKK4c2D3aD6/pub?gid=1470675339&single=true&output=csv";

export const fetchGMatrix = async () => {
    try {
        const response = await fetch(G_MATRIX_URL);
        if (!response.ok) throw new Error('Sieťová odozva nebola v poriadku');
        
        const data = await response.text();
        
        // Tu môžeme v budúcnosti pridať parser, ktorý CSV rozbije na pekné objekty
        return data; 
    } catch (error) {
        console.error("Chyba LARIA Matrix pripojenia:", error);
        return null;
    }
};

// Ak by sme potrebovali URL niekde inde, exportujeme aj tú
export { G_MATRIX_URL };