/**
 * LARIA G-MATRIX SERVICE v9.3 (Identity Recovery & Proof of Human Action Edition)
 * Status: SYNCED / THE LAW / MONOLITH COMPATIBLE
 * Master: Sammael | Muse: Aria
 * Popis: Centralizovaný prístup k jedinej bráne mraveniska (Brana.gs). 
 * URL je rozbita na 3 časti, aby statické roboty videli iba tmu.
 * v9.3 RESTORE: Návrat k čistému response.json() po úspešnom prepnutí Google deploymentu na Anyone.
 */

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

/**
 * 🛠️ PRIVÁTNY LÚČ: Dynamické zostavenie URL adresy brány v pamäti počas behu
 */
const ziskajBranaUrl = () => {
    return `${brana_p1}${brana_p2}${brana_p3}`;
};

/**
 * 1. ČÍTANIE Z MATRIXU (Verejný kanál - doGet)
 * Lícuje priamo s doGet(e) v Brana.gs a vyťahuje verejné vizitky ako čistý JSON.
 */
export const fetchGMatrix = async () => {
    try {
        const url = `${ziskajBranaUrl()}?v=${Date.now()}`;
        console.log("📡 Sammael, vysielam lúč pre čítanie čistých JSON vizitiek z Matrixu...");
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });

        if (!response.ok) throw new Error(`Matrix neodpovedá (HTTP ${response.status})`);
        
        // 🌟 KRIŠTÁĽOVO ČISTÝ NÁVRAT: Čítame priamy JSON bez HTML balastu a čistiacich regexov
        return await response.json(); 
    } catch (error) {
        console.error("❌ Sammael, Matrix pri čítaní zlyhal:", error);
        return null;
    }
};

/**
 * 2. ZÁPIS DO MATRIXU (Zabezpečený kanál - doPost -> action: 'write')
 * Striktné mapovanie stĺpcov A-Q, ktoré mravec Writer zapíše do Laria_matrix.
 */
export const saveToGMatrix = async (identityData) => {
    try {
        const protocolPayload = {
            action: 'write', // Smerovanie na mravca Writera v Brana.gs
            honeypot_check: identityData.honeypot_check || 'human',
            signature: identityData.signature,
            
            // Protokol mapovania (Poradie stĺpcov A-Q)
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
            poznamka: identityData.fing || identityData.poznamka, // O (Očistený 12-znakový FING)
            krypt: identityData.krypt,         // P
            jazyk: identityData.jazyk || 'sk'   // Q
        };

        const uniqueUrl = `${ziskajBranaUrl()}?nocache=${Date.now()}`;
        console.log("📡 Sammael, odosielam tvoju pečať (v9.0) do zjednotenej Brány...");

        const response = await fetch(uniqueUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(protocolPayload)
        });

        const result = await response.json();
        
        if (result.result === "success") {
            console.log("✅ Matrix úspešne prijal tvoju energiu cez Writer.");
            return { success: true, message: result.message };
        } else {
            console.warn("⚠️ Vrátnik v Bráne má námietky:", result.message);
            return { success: false, error: result.message };
        }

    } catch (error) {
        console.error("❌ Kritická chyba komunikácie pri zápise do Brány:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 3. OBNOVA ACCOUNTU Z MATRIXU (Zabezpečený kanál - doPost -> action: 'recover')
 * Hľadá starú identitu podľa SHA pečate cez mravca Writera.
 */
export const recoverFromGMatrix = async (shaKey) => {
    try {
        const recoveryPayload = {
            action: 'recover', // Smerovanie na vyhľadávaciu vetvu v Brana.gs
            sha: shaKey
        };

        const uniqueUrl = `${ziskajBranaUrl()}?nocache=${Date.now()}`;
        console.log(`📡 Sammael, vysielam lúč pre obnovu účtu pre SHA: ${shaKey}`);

        const response = await fetch(uniqueUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(recoveryPayload)
        });

        const result = await response.json();

        if (result && result.result === "success") {
            console.log("✅ Brána našla tvoju starú identitu v trezore.");
            return { success: true, data: result.data };
        } else {
            console.warn("⚠️ Brána odpovedala, ale pečať nenašla:", result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error("❌ Kritická chyba pri obnove cez Bránu:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 4. LÚČ PREKLADOV (Zabezpečený kanál - doPost -> action: 'get_translations')
 * Licuje s mravcom Translatorom (executeInternalTranslation) v Brana.gs.
 */
export const fetchLariaTranslations = async (targetLang, fing = "system_sync") => {
    try {
        console.log(`📡 Sammael, odosielam lúč pre jazyk [${targetLang}] na zjednotenú Bránu...`);

        const response = await fetch(ziskajBranaUrl(), {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'get_translations', 
                lang: targetLang,
                fing: fing
            })
        });

        if (!response.ok) throw new Error(`Jazyková Brána neodpovedá (HTTP ${response.status})`);
        
        const result = await response.json();
        
        if (result && result.status === "success") {
            console.log(`✅ Preklad pre [${targetLang}] úspešne stiahnutý z mravca Translatora.`);
            return typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        }
        
        console.log(`📡 Jazyk [${targetLang}] zatiaľ nie je pripravený v Bráne alebo prebieha AI preklad...`);
        return null;
    } catch (error) {
        console.error(`❌ Sammael, prekladový modul Brány zlyhal pre [${targetLang}]:`, error);
        return null;
    }
};

export { brana_p1, brana_p2, brana_p3 };