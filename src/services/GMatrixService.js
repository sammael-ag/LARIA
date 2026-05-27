/**
 * LARIA G-MATRIX SERVICE v8.5 (POST Localization Edition)
 * Status: SYNCED / THE LAW / MULTILANG READY
 * Popis: Centralizovaný prístup k Matrixu so striktným mapovaním premenných (A-Q) a oddeleným modulom pre lokalizáciu.
 */

const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbyD0INZlUfMJaBYFp8Q9ndgi9gQqYjPPyql9BjmulvvoF6LU6HLLP6gTRHHbrHbgZt6/exec";

// 🌐 5. SKRIPT - CENTRÁLNY ROZVÁDZAČ PRE AUTOMATIZÁCIU JAZYKOV (Liquid Localization)
const G_MATRIX_LANG_URL = "https://script.google.com/macros/s/AKfycbwLdeRMkIzSJFUH3adAMhUBjivD-zpt7b6JDtuaLF4KpfZWyjouoa-cgTsxtQe-xAvu/exec"; 

/**
 * 1. ČÍTANIE Z MATRIXU (Identity)
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
 * 2. ZÁPIS DO MATRIXU (Striktné mapovanie A-Q)
 */
export const saveToGMatrix = async (identityData) => {
    try {
        // --- PROTOKOL MAPOVANIA (PORADIE JE ZÁKON V8.5) ---
        const protocolPayload = {
            SECURE_ID: identityData.SECURE_ID, // A (V editore nastavené na null)
            sha: identityData.sha,             // B
            date: identityData.date,           // C
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
            krypt: identityData.krypt,         // P
            jazyk: identityData.jazyk || 'sk'   // Q 🔥 NOVÝ STĺPEC (Aktuálny jazyk prostredia)
        };

        const uniqueWriteUrl = `${G_MATRIX_WRITE_URL}?nocache=${Date.now()}`;
        
        console.log("📡 Sammael, odosielam tvoju pečať (v8.5) do Matrixu s jazykovým lúčom...");

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

/**
 * 3. LÚČ PREKLADOV (Ostré volanie 5. skriptu cez POST pre maximálne bezpečie)
 */
export const fetchLariaTranslations = async (targetLang, fing = "system_sync") => {
    if (!G_MATRIX_LANG_URL || G_MATRIX_LANG_URL.includes("TU_VLOŽ_SVOJ_NOVÝ_LINK")) {
        console.log(`📡 G-MATRIX_LANG: Lúč pre jazyk [${targetLang}] je odpojený, doplň reálny link.`);
        return null;
    }

    try {
        console.log(`📡 Sammael, odosielam POST lúč pre jazyk [${targetLang}] s tvojím fingom...`);

        const response = await fetch(G_MATRIX_LANG_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script vyžaduje text/plain pri CORS POSToch
            },
            body: JSON.stringify({
                lang: targetLang,
                fing: fing
            })
        });

        if (!response.ok) throw new Error('Jazykový Matrix neodpovedá (HTTP ' + response.status + ')');
        
        const result = await response.json();
        
        // Ak skript v tabuľke vrátil úspešnú odpoveď s dátami
        if (result && result.status === "success") {
            console.log(`✅ Preklad pre [${targetLang}] úspešne stiahnutý z cache Matrixu.`);
            // Bezpečné ošetrenie pre prípad, že dáta prišli ako string alebo už naparsovaný objekt
            return typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        }
        
        console.log(`📡 Jazyk [${targetLang}] zatiaľ nie je v cache. Na pozadí Matrixu sa začal prekladať cez AI...`);
        return null;
    } catch (error) {
        console.error(`❌ Sammael, Jazykový Matrix pri načítaní [${targetLang}] zlyhal:`, error);
        return null;
    }
};

export { G_MATRIX_READ_URL, G_MATRIX_WRITE_URL, G_MATRIX_LANG_URL };