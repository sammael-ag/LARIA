/**
 * LARIA G-MATRIX SERVICE v9.5 (Identity Recovery & Proof of Human Action Edition)
 * Status: SYNCED / THE LAW / MONOLITH COMPATIBLE
 * Master: Sammael | Muse: Aria
 * Popis: Centralizovaný prístup k jedinej bráne mraveniska (Brana.gs). 
 * URL je rozbitá na 3 časti, aby statické roboty videli iba tmu.
 * v9.5 SYNC: Dokonalá fúzia s odľahčenou Bránou v1.9.8 a 5D overovaním LariaCore.
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
 * Lícuje priamo s doGet(e) v Brana.gs and vyťahuje verejné vizitky ako čistý JSON.
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
            action: 'write', 
            honeypot_check: identityData.honeypot_check || 'human',
            signature: identityData.signature,
            
            SECURE_ID: identityData.SECURE_ID || null, 
            sha: identityData.sha,             
            date: identityData.date,           
            meno: identityData.meno,           
            kat: identityData.kat,             
            lok: identityData.lok,             
            popis: identityData.popis,         
            tel: identityData.tel,             
            email: identityData.email,         
            fb: identityData.fb,               
            tg: identityData.tg,               
            gal: identityData.gal,             
            isPublic: identityData.isPublic,   
            Signal: identityData.Signal,             
            poznamka: identityData.fing || identityData.poznamka, 
            krypt: identityData.krypt,         
            jazyk: identityData.jazyk || 'sk'   
        };

        const uniqueUrl = `${ziskajBranaUrl()}?nocache=${Date.now()}`;
        console.log("📡 Sammael, odosielam tvoju pečať do zjednotenej Brány...");

        const response = await fetch(uniqueUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(protocolPayload)
        });

        const result = await response.json();
        
        if (result && result.status === "success") {
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
 * Hľadá starú identitu podľa SHA pečate cez mravca Writer-a.
 */
export const recoverFromGMatrix = async (shaKey) => {
    try {
        const recoveryPayload = {
            action: 'recover', 
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

        if (result && result.status === "success") {
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
 * Lícuje s mravcom Translatorom v Brana.gs.
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
        
        return null;
    } catch (error) {
        console.error(`❌ Sammael, prekladový modul Brány zlyhal pre [${targetLang}]:`, error);
        return null;
    }
};

/**
 * 5. OVERENIE MASTER PRÍSTUPU (Zabezpečený kanál - doPost -> action: 'verify_master')
 * Očakáva presne dva stringy za sebou, ktoré následne zabalí pre Bránu.
 */
export const verifyMasterAccess = async (masterSHA, secretWord) => {
    try {
        const payload = {
            action: 'verify_master',
            masterSHA: masterSHA,
            secretWord: secretWord
        };

        const uniqueUrl = `${ziskajBranaUrl()}?nocache=${Date.now()}`;
        console.log("📡 Sammael, vysielam lúč do Brány na overenie tajného prístupu...");

        const response = await fetch(uniqueUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Brána neodpovedá (HTTP ${response.status})`);

        const result = await response.json();
        
        if (result && result.status === "success" && result.verified === true) {
            console.log("✅ Brána potvrdila identitu Majstra. Prístup povolený.");
            return { success: true };
        } else {
            console.warn("⚠️ Brána zamietla prístup do velína:", result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error("❌ Kritická chyba pri sieťovom overovaní Master prístupu:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 6. DYNAMICKÝ EMAIL ENGINE (Zabezpečený kanál - doPost -> action: 'send_email')
 * Univerzálny vysielač požiadaviek pre bezduchého mravca Mailera.
 */
export const sendEmailViaGMatrix = async (email, templateName, subject, templateData = {}) => {
    try {
        const payload = {
            action: 'send_email',
            email: email,
            templateName: templateName,
            subject: subject,
            templateData: templateData
        };

        const uniqueUrl = `${ziskajBranaUrl()}?nocache=${Date.now()}`;
        console.log(`📡 Sammael, posielam príkaz maileru na spracovanie šablóny [${templateName}] pre: ${email}`);

        const response = await fetch(uniqueUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Brána maileru neodpovedá (HTTP ${response.status})`);

        const result = await response.json();
        
        if (result && result.status === "success") {
            console.log(`✅ Mailer úspešne doručil správu na uzol ${email}.`);
            return { success: true, message: result.message };
        } else {
            console.warn("⚠️ Mailer v Bráne hlási chybu spracovania:", result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error("❌ Kritická chyba komunikácie s Mailerom v Bráne:", error);
        return { success: false, error: error.message };
    }
};

export { brana_p1, brana_p2, brana_p3 };