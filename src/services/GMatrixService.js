/**
 * LARIA G-MATRIX SERVICE v8.0
 * Status: SYNCED / THE LAW
 * Popis: Centralizovaný prístup k Matrixu so striktným mapovaním premenných.
 */

// Link na čítanie (Renderer) - v8.0
const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

// Link na zápis (Tvoj VRÁTNIK v8.0)
// POZOR: Sem vlož nové URL z nasadenia skriptu LARIA WRITER v8.0, ak sa zmenilo
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbyD0INZlUfMJaBYFp8Q9ndgi9gQqYjPPyql9BjmulvvoF6LU6HLLP6gTRHHbrHbgZt6/exec";

/**
 * 1. ČÍTANIE Z MATRIXU (Synchronizácia siete)
 */
export const fetchGMatrix = async () => {
    try {
        // Cache Breaker zabezpečí, že nečítame staré dáta
        const response = await fetch(`${G_MATRIX_READ_URL}?v=${Date.now()}`);
        if (!response.ok) throw new Error('Matrix neodpovedá (HTTP ' + response.status + ')');
        
        const rawData = await response.json(); 
        
        // Tu môžeme pridať mapovanie, ak by Renderer vracal staré názvy, 
        // ale náš Renderer v8.0 už vracia čisté dáta.
        return rawData; 
    } catch (error) {
        console.error("❌ Sammael, Matrix pri čítaní zlyhal:", error);
        return null;
    }
};

/**
 * 2. ZÁPIS DO MATRIXU (Aktualizácia tvojej identity v sieti)
 */
export const saveToGMatrix = async (identityData) => {
    try {
        // TU SA DEJE MÁGIA MAPOVANIA (Z mobilu do Tabuľky)
        // Musíme poslať presne to, čo náš skript v Tabuľke očakáva.
        const protocolPayload = {
            SECURE_ID: identityData.SECURE_ID || identityData.sha,
            sha: identityData.sha,
            meno: identityData.meno,
            kat: identityData.kat || 'Majster',
            lok: identityData.lok || 'Matrix',
            popis: identityData.popis || '',
            tel: identityData.tel || '',
            email: identityData.email || '',
            fb: identityData.fb || '',
            tg: identityData.tg || '',
            gal: identityData.gal || '',
            isPublic: identityData.isPublic || false,
            irc: identityData.irc || '',
            poznamka: identityData.poznamka || 'Odoslané z Laria Mobile v8.0',
            krypt: identityData.krypt // Adresa peňaženky
        };

        const uniqueWriteUrl = `${G_MATRIX_WRITE_URL}?nocache=${Date.now()}`;
        
        console.log("📡 Sammael, odosielam tvoju pečať do Matrixu...");

        const response = await fetch(uniqueWriteUrl, {
            method: 'POST',
            mode: 'cors', 
            redirect: 'follow', 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(protocolPayload)
        });

        const result = await response.json();
        
        if (result.result === "success") {
            console.log("✅ Matrix úspešne prijal tvoju energiu.");
            return { success: true, message: result.message, system: result.system };
        } else {
            console.warn("⚠️ Vrátnik v kaviarni má námietky:", result.message);
            return { success: false, error: result.message };
        }

    } catch (error) {
        console.error("❌ Kritická chyba komunikácie s Matrixom:", error);
        return { success: false, error: error.message };
    }
};

export { G_MATRIX_READ_URL, G_MATRIX_WRITE_URL };