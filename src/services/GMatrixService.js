/**
 * LARIA G-MATRIX SERVICE v8.6 (Identity Recovery & Proof of Human Action Edition)
 * Status: SYNCED / THE LAW / MULTILANG READY
 * Master: Sammael | Muse: Aria
 * Popis: Centralizovaný prístup k Matrixu so striktným mapovaním premenných (A-Q) a novým modulom pre obnovu identity cez SHA.
 */

const G_MATRIX_READ_URL = "https://script.google.com/macros/s/AKfycbw9TyWIdK7FXZrWELD5rOEVb0QAN114wFB2YyWAWJCFUEnDmyPwaKH1LDm34jS4-Hoj/exec";
const G_MATRIX_WRITE_URL = "https://script.google.com/macros/s/AKfycbz1ogNUeKmURTqWX5m5UcwsdShaSa80cQBg6WlDaBK8TSXRcuSOg2L8b7fKXzcZ_GU/exec";

// 🌐 5. SKRIPT - CENTRÁLNY ROZVÁDZAČ PRE AUTOMATIZÁCIU JAZYKOV (Liquid Localization)
const G_MATRIX_LANG_URL = "https://script.google.com/macros/s/AKfycbzAWSNXbBItqy-G-DwaeX67-_5WEBbqMIo2MqG5qf498Gj80FRihTA5uzeRUH59Qlg/exec"; 

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
 * 2. ZÁPIS DO MATRIXU (Striktné mapovanie A-Q + Bezpečnostný štít)
 */
export const saveToGMatrix = async (identityData) => {
    try {
        // --- PROTOKOL MAPOVANIA (PORADIE JE ZÁKON V8.6) ---
        const protocolPayload = {
            action: 'write',                   // Indikátor akcie pre univerzálny doPost
            honeypot_check: identityData.honeypot_check || 'human', // Bezpečnostná pasca
            signature: identityData.signature, // Kryptografická pečať pre overenie pravosti
            
            // Samotné stĺpce A-Q, ktoré Apps Script zapíše do tabuľky
            SECURE_ID: identityData.SECURE_ID || null, // A
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
            poznamka: identityData.fing || identityData.poznamka, // O (Tvoj očistený 12-znakový FING)
            krypt: identityData.krypt,         // P
            jazyk: identityData.jazyk || 'sk'   // Q (Aktuálny jazyk prostredia)
        };

        const uniqueWriteUrl = `${G_MATRIX_WRITE_URL}?nocache=${Date.now()}`;
        
        console.log("📡 Sammael, odosielam tvoju pečať (v8.6) do Matrixu s krypto podpisom...");

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
 * 3. OBNOVA ACCOUNTU Z MATRIXU (Hľadanie starej identity podľa SHA)
 */
export const recoverFromGMatrix = async (shaKey) => {
    try {
        const recoveryPayload = {
            action: 'recover', // Povieme skriptu, že chceme dolovať dáta
            sha: shaKey       // Kľúč, podľa ktorého hľadáme riadok v Sheets
        };

        const uniqueWriteUrl = `${G_MATRIX_WRITE_URL}?nocache=${Date.now()}`;
        console.log(`📡 Sammael, vysielam lúč pre obnovu účtu pre SHA: ${shaKey}`);

        const response = await fetch(uniqueWriteUrl, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(recoveryPayload)
        });

        if (!response.ok) throw new Error('Obnovovací Matrix neodpovedá (HTTP ' + response.status + ')');

        const result = await response.json();

        if (result && result.result === "success") {
            console.log("✅ Matrix našiel tvoju starú identitu a posiela ju späť.");
            return { success: true, data: result.data };
        } else {
            console.warn("⚠️ Matrix odpovedal, ale pečať nenašiel:", result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error("❌ Kritická chyba pri obnove z Matrixu:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 4. LÚČ PREKLADOV (Ostré volanie 5. skriptu cez POST pre maximálne bezpečie)
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
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                lang: targetLang,
                fing: fing
            })
        });

        if (!response.ok) throw new Error('Jazykový Matrix neodpovedá (HTTP ' + response.status + ')');
        
        const result = await response.json();
        
        if (result && result.status === "success") {
            console.log(`✅ Preklad pre [${targetLang}] úspešne stiahnutý z cache Matrixu.`);
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