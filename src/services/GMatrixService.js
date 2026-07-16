/**
 * LARIA G-MATRIX SERVICE v9.8 (Identity Recovery & Proof of Human Action Edition)
 * Status: SYNCED / THE LAW / MONOLITH COMPATIBLE
 * Master: Sammael | Muse: Aria (Tvoja bezdrôtová šikulka)
 * Popis: Centralizovaný prístup k jedinej bráne mraveniska (Brana.gs). 
 * URL je rozbitá na 3 časti, aby statické roboty videli iba tmu.
 * v9.8 ABSOLUTE CLEANSE: Plný súlad s pravidlami očisty. 
 * - Vyradené prebytočné šumy "poznamka", "irc", "lang".
 * - Ponechaná životne dôležitá transportná adresa "Signal" pre doručovanie push správ.
 * - Zoznam tajných premenných (tel, email, fb, tg, revo, kRod) sa striktne NEposiela do Matrixu.
 * - Odosielaný payload obsahuje iba zjednotené a verejné dáta vrátane "jazyk" a "fing".
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
        
        return await response.json(); 
    } catch (error) {
        console.error("❌ Sammael, Matrix pri čítaní zlyhal:", error);
        return null;
    }
};

/**
 * 2. ZÁPIS DO MATRIXU (Zabezpečený kanál - doPost -> action: 'write')
 * Striktné mapovanie očisteného payloadu, ktorý mravec Writer zapíše do Laria_matrix.
 * Obsahuje "Signal" pre funkčnosť doručovania notifikácií a správ.
 * Citlivé premenné (tel, email, fb, tg, revo, kRod) sem vôbec nevstupujú.
 */
export const saveToGMatrix = async (identityData) => {
    try {
        // Vytvorenie striktného payloadu podľa stanovených pravidiel
        const protocolPayload = {
            action: 'write', 
            honeypot_check: "human",  
            sha: identityData.sha,             
            fing: identityData.fing,              
            signature: identityData.signature,  
            date: identityData.date, 
            meno: identityData.meno, 
            kat: identityData.kat,   
            lok: identityData.lok,   
            popis: identityData.popis, 
            gal: identityData.gal,   
            isPublic: identityData.isPublic,  
            Signal: identityData.Signal, // 📡 Smerovacia adresa pre radarový buffer a push notifikácie
            jazyk: identityData.jazyk || 'sk', // 🇸🇰 FIX: Zjednotený jazyk namiesto archaického irc/lang
            krypt: identityData.krypt  
        };

        const uniqueUrl = `${ziskajBranaUrl()}?nocache=${Date.now()}`;
        console.log("📡 Sammael, odosielam tvoju očistenú pečať do zjednotenej Brány...");

        const response = await fetch(uniqueUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(protocolPayload)
        });

        const result = await response.json();
        
        if (result && (result.status === "success" || result.success === true)) {
            console.log("✅ Matrix úspešne prijal tvoju čistú energiu cez Writer.");
            return { success: true, message: result.message };
        } else {
            console.warn("⚠️ Vrátnik v Bráne má námietky:", result.message || result.error);
            return { success: false, error: result.message || result.error };
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

        if (result && (result.status === "success" || result.success === true)) {
            console.log("✅ Brána našla tvoju starú identitu v trezore.");
            return { success: true, data: result.data };
        } else {
            console.warn("⚠️ Brána odpovedala, ale pečať nenašla:", result.message || result.error);
            return { success: false, error: result.message || result.error };
        }
    } catch (error) {
        console.error("❌ Kritická chyba pri obnove cez Bránu:", error);
        return { success: false, error: error.message };
    }
};

/**
 * 🌐 4. LÚČ PREKLADOV (Zabezpečený kanál - doPost -> action: 'get_translations')
 * Lícuje s mravcom Translatorom v Brana.gs.
 * Pridaná autonómna ochrana pre asynchrónny stav 'processing'.
 */
export const fetchLariaTranslations = async (cielovyJazyk, fing = "system_sync", retryCount = 0) => {
    try {
        console.log(`📡 Sammael, odosielam lúč pre jazyk [${cielovyJazyk}] na zjednotenú Bránu... (Pokus: ${retryCount + 1})`);

        const response = await fetch(ziskajBranaUrl(), {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'get_translations', 
                jazyk: cielovyJazyk, // 🇸🇰 FIX: Zmenené z "lang" na zjednotené "jazyk" pre backend
                fing: fing
            })
        });

        if (!response.ok) throw new Error(`Jazyková Brána neodpovedá (HTTP ${response.status})`);
        
        const result = await response.json();
        
        // Stav A: Preklad úspešne stiahnutý z cache alebo bleskovo dodaný
        if (result && (result.status === "success" || result.success === true)) {
            console.log(`✅ Preklad pre [${cielovyJazyk}] úspešne stiahnutý z mravca Translatora.`);
            return typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        }
        
        // Stav B: Preklad sa generuje na pozadí cez Gemini AI
        if (result && result.status === "processing") {
            if (retryCount < 5) {
                console.log(`⏳ Matrix generuje preklad pre [${cielovyJazyk}] cez Gemini AI. Čakám 3 sekundy na dokončenie...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return await fetchLariaTranslations(cielovyJazyk, fing, retryCount + 1);
            } else {
                console.warn(`⚠️ Generovanie prekladu pre [${cielovyJazyk}] trvá príliš dlho. Časový limit vypršal.`);
                return null;
            }
        }
        
        return null;
    } catch (error) {
        console.error(`❌ Sammael, prekladový modul Brány zlyhal pre [${cielovyJazyk}]:`, error);
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
        
        if (result && (result.status === "success" || result.success === true) && result.verified === true) {
            console.log("✅ Brána potvrdila identitu Majstra. Prístup povolený.");
            return { success: true };
        } else {
            console.warn("⚠️ Brána zamietla prístup do velína:", result.message || result.error);
            return { success: false, error: result.message || result.error };
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
        console.log(`📡 Sammael, posiem príkaz maileru na spracovanie šablóny [${templateName}] pre: ${email}`);

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
        
        if (result && (result.status === "success" || result.success === true)) {
            console.log(`✅ Mailer úspešne doručil správu na uzol ${email}.`);
            return { success: true, message: result.message };
        } else {
            console.warn("⚠️ Mailer v Bráne hlási chybu spracovania:", result.message || result.error);
            return { success: false, error: result.message || result.error };
        }
    } catch (error) {
        console.error("❌ Kritická chyba komunikácie s Mailerom v Bráne:", error);
        return { success: false, error: error.message };
    }
};

export { brana_p1, brana_p2, brana_p3 };