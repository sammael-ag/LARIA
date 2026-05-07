/**
 * LARIA G-MATRIX SERVICE v8.3
 * Status: SYNCED / THE LAW / HANDSHAKE READY
 * Popis: Centralizovaný prístup k Matrixu so striktným mapovaním premenných (SECURE_ID, sha, date...).
 */

const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbyD0INZlUfMJaBYFp8Q9ndgi9gQqYjPPyql9BjmulvvoF6LU6HLLP6gTRHHbrHbgZt6/exec";

/**
 * 1. ČÍTANIE Z MATRIXU
 */
export const fetchGMatrix = async () => {
    try {
        const response = await fetch(`${G_MATRIX_READ_URL}?v=${Date.now()}`);
        if (!response.ok) throw new Error('Matrix neodpovedá (HTTP ' + response.status + ')');
        return await response.json(); 
    } catch (error) {
        console.error("❌ Sammael, Matrix pri čítaní zlyhal:", error);
        return null;
    }
};

/**
 * 2. ZÁPIS DO MATRIXU (Striktné mapovanie A-P)
 */
export const saveToGMatrix = async (identityData) => {
    try {
        // --- PROTIKOL MAPOVANIA (PORADIE JE ZÁKON) ---
        const protocolPayload = {
            SECURE_ID: identityData.SECURE_ID, // A (V editore nastavené na null)
            sha: identityData.sha,             // B
            date: identityData.date,           // C (Pridané!)
            meno: identityData.meno,           // D
            kat: identityData.kat,             // E
            lok: identityData.lok,             // F
            popis: identityData.popis,         // G
            tel: identityData.tel,             // H
            email: identityData.email,         // I
            fb: identityData.fb,               // J
            tg: identityData.tg,               // K
            gal: identityData.gal,             // L
            isPublic: identityData.isPublic,   // M
            irc: identityData.irc,             // N
            poznamka: identityData.poznamka,   // O (Tvoj FING)
            krypt: identityData.krypt          // P
        };

        const uniqueWriteUrl = `${G_MATRIX_WRITE_URL}?nocache=${Date.now()}`;
        
        console.log("📡 Sammael, odosielam tvoju pečať (v8.3) do Matrixu...");

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
            return { success: true, message: result.message };
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