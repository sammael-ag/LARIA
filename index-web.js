/**
 * LARIA WEB ENGINE - DYNAMICKÉ ČAKRY
 * LOGIC v4.5 - Stabilizované pre Renderer v7.1
 * Čistý kód s diagnostikou surových dát.
 */

// TU VLOŽ SVOJU NOVÚ URL Z RENDERER SKRIPTU
const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. NAČÍTANIE DÁT (SYNERGIA S RENDEREROM) ---
async function loadDataFromGSheets() {
    console.log("🚀 Matrix: Štartujem sťahovanie dát...");
    const container = document.getElementById('cards-container');
    
    try {
        const response = await fetch(READ_URL);
        if (!response.ok) throw new Error("Matrix neodpovedá (HTTP Error)");
        
        // --- 🔍 DETEKTÍVNA KONTROLA SUROVÝCH DÁT ---
        const textData = await response.text(); 
        console.log("📥 Surové dáta z Matrixu:", textData);
        
        let rawData;
        try {
            rawData = JSON.parse(textData);
        } catch (e) {
            console.error("❌ Kritická chyba: Matrix neposlal JSON!", textData);
            throw new Error("Prijatý text nie je platný JSON formát.");
        }

        if (!Array.isArray(rawData)) {
            console.error("❌ Chyba formátu: Očakával som pole [], prišlo:", typeof rawData);
            throw new Error("Dáta prišli v nesprávnom formáte (nie je to pole).");
        }
        // ------------------------------------------

        console.log("✅ Dáta spracované, počet záznamov:", rawData.length);

        allData = rawData.map(item => {
            // Renderer v7.1 mapuje LOKALITA -> lok a PUBLIC -> public
            const publicStatus = item.public; 

            return {
                id: item.sha || "no-sha",
                datum: item.timestamp,
                meno: item.meno || "Neznámy Majster",
                kat: item.kat || "Všeobecné",
                lok: item.lok || "Neznáma lokalita",
                popis: item.popis || "",
                tel: item.tel ? item.tel.toString().trim() : "",
                email: item.email || "",
                fb: item.fb || "",
                tg: item.tg || "",
                gal: item.gal || "",
                isPublic: publicStatus === true || String(publicStatus).toUpperCase() === "TRUE"
            };
        }).filter(item => item.isPublic === true);

        applyFilter();
    } catch (e) {
        console.error("❌ Matrix offline:", e);
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 50px;">
                    <p style="color:#F0F; font-family:monospace; font-weight:bold;">[ KRYPTICKÁ_CHYBA_MATRIXU ]</p>
                    <p style="color:#555; font-size:12px; margin-top:10px;">DETAIL: ${e.message}</p>
                    <p style="color:#333; font-size:10px; margin-top:20px;">Skontroluj konzolu (F12) pre výpis surových dát.</p>
                </div>`;
        }
    }
}

// --- 2. RENDER KARIET (GALÉRIA ARTEFAKTOV) ---
function renderCards(data) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="text-cyber" style="text-align:center; width:100%; opacity:0.5;">Ticho v éteri... (žiadne verejné vizitky)</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <span class="tag">${item.kat}</span>
            <h2 class="card-title">${item.meno}</h2>
            <p class="card-loc">📍 ${item.lok}</p>
            <p class="card-desc">${item.popis ? aktivujOdkazy(item.popis) : 'Bez popisu.'}</p>
            
            <div class="card-actions">
                <button onclick="sendToApp('${item.id}')" class="btn-add">[ PRIDAŤ ]</button>
                <button onclick="copyShareLink('${item.id}')" class="btn-share">[ LINK ]</button>
            </div>

            <div class="card-links">
                ${item.tel ? `<a href="tel:${item.tel.replace(/\s/g, '')}">VOLAŤ</a>` : ''}
                ${item.tg ? `<a href="${item.tg}" target="_blank">TG</a>` : ''}
                ${item.gal ? `<a href="${item.gal}" target="_blank">GALÉRIA</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 3. KYBERNETICKÝ MOST (APP SYNC) ---
function sendToApp(id) {
    const item = allData.find(i => i.id === id);
    if (!item) return;

    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ADD_CONTACT',
            payload: {
                id: item.id,
                name: item.meno,
                cat: item.kat,
                loc: item.lok,
                desc: item.popis,
                tel: item.tel,
                email: item.email,
                gal: item.gal,
                fb: item.fb,
                tg: item.tg
            }
        }));
    } else {
        alert("Pre uloženie vizitky otvor tento web priamo v appke LARIA.");
    }
}

// --- 4. POMOCNÉ FUNKCIE (FILTRE & FORMÁT) ---
const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

const aktivujOdkazy = (text) => {
    if (!text) return "";
    let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return safeText.replace(urlPattern, '<a href="$1" target="_blank" class="text-cyber">$1</a>');
};

function applyFilter() {
    const term = document.getElementById('searchInput')?.value || '';
    const filtered = allData.filter(item => {
        const matchCat = (currentCategory === 'vsetko' || (item.kat && item.kat.toLowerCase() === currentCategory.toLowerCase()));
        const searchContent = removeAccents(`${item.meno} ${item.lok} ${item.popis}`.toLowerCase());
        const matchSearch = term.length < 2 || searchContent.includes(removeAccents(term.toLowerCase()));
        return matchCat && matchSearch;
    });
    renderCards(filtered);
}

// --- 5. GLOBÁLNE ROZHRANIE ---
window.setCategory = (cat) => {
    currentCategory = cat;
    applyFilter();
};

window.copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "[ SKOPÍROVANÉ! ]";
        setTimeout(() => btn.innerText = originalText, 2000);
    });
};

// ŠTART
window.onload = loadDataFromGSheets;