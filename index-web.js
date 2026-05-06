/**
 * LARIA WEB ENGINE - BEZPEČNÁ ČAKRA v5.6
 * LOGIC: Zjednotená verzia so stabilným načítaním
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. ŠTART A DEEP LINKING ---
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id'); 
    await loadDataFromGSheets(targetId);
};

// --- 2. NAČÍTANIE DÁT (Stabilizovaná metóda) ---
async function loadDataFromGSheets(targetId = null) {
    console.log("🚀 Matrix: Synchronizácia dát...");
    const container = document.getElementById('cards-container');
    
    try {
        const response = await fetch(READ_URL);
        if (!response.ok) throw new Error("Matrix neodpovedá (HTTP Error)");
        
        // Použijeme tvoju detektívnu metódu, ktorá je stabilnejšia
        const textData = await response.text();
        let rawData;
        try {
            rawData = JSON.parse(textData);
        } catch (e) {
            console.error("❌ Kritická chyba JSONu:", textData);
            throw new Error("Prijatý text nie je platný JSON.");
        }

        allData = rawData.map(item => {
            // Unikátny 12-znakový fingerprint pre URL
            const fingerprint = item.sha ? item.sha.substring(0, 12) : "no-sha";

            return {
                id: fingerprint,
                fullSha: item.sha, 
                meno: item.meno || "Neznámy Majster",
                kat: item.kat || "Všeobecné",
                lok: item.lok || "V sieti",
                popis: item.popis || "",
                gal: item.gal || "", 
                isPublic: item.public === true || String(item.public).toUpperCase() === "TRUE"
            };
        }).filter(item => item.isPublic);

        if (targetId) {
            const soloItem = allData.find(i => i.id === targetId);
            if (soloItem) {
                renderCards([soloItem], true);
                return;
            }
        }
        applyFilter();
    } catch (e) {
        console.error("❌ Matrix offline:", e);
        if (container) {
            container.innerHTML = `<p style="color:#F0F; text-align:center; padding:50px;">[ CHYBA_MATRIXU: ${e.message} ]</p>`;
        }
    }
}

// --- 3. RENDER KARIET ---
function renderCards(data, isSolo = false) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (isSolo) {
        const backBtn = document.createElement('div');
        backBtn.style.width = "100%";
        backBtn.style.maxWidth = "500px";
        backBtn.innerHTML = `<button onclick="window.location.href='index.html'" class="btn-share" style="margin-bottom: 20px; width:100%;">[ ↩ SPÄŤ DO SIETE ]</button>`;
        container.appendChild(backBtn);
    }

    if (data.length === 0) {
        container.innerHTML = '<p class="text-cyber" style="text-align:center; width:100%; opacity:0.5;">Ticho v éteri...</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = isSolo ? 'card card-solo' : 'card';
        if (!isSolo) card.style.cursor = 'pointer';
        
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                window.location.href = `?id=${item.id}`;
            }
        };

        card.innerHTML = `
            <span class="tag">${item.kat}</span>
            <h2 class="card-title">${item.meno}</h2>
            <p class="card-loc">📍 ${item.lok}</p>
            <p class="card-desc">${aktivujOdkazy(item.popis)}</p>
            
            <div class="card-actions">
                <button onclick="smartAdd('${item.id}')" class="btn-add">[ PRIDAŤ ]</button>
                <button onclick="copyShareLink('${item.id}')" class="btn-share">[ LINK ]</button>
            </div>

            <div class="card-links">
                ${item.gal ? `<a href="${item.gal}" target="_blank" style="color: #FF0; font-size: 10px;">[ GALÉRIA ARTEFAKTOV ]</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. INTELIGENTNÝ MOST (SMART ADD) ---
function smartAdd(fingerprint) {
    const item = allData.find(i => i.id === fingerprint);
    if (!item) return;

    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'ADD_CONTACT', 
            payload: { ...item, id: item.fullSha } // Posielame celé SHA do appky
        }));
    } else {
        window.location.href = `laria://contact/${item.id}`;
        setTimeout(() => {
            if (document.hasFocus()) {
                if (confirm("[ LARIA APP ]\n\nPre uloženie vizitky potrebuješ našu appku. Chceš ju stiahnuť?")) {
                    window.location.href = "download.html?id=" + fingerprint;
                }
            }
        }, 1500);
    }
}

// --- POMOCNÉ FUNKCIE ---
const aktivujOdkazy = (text) => {
    if (!text) return "Bez popisu.";
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, '<a href="$1" target="_blank" class="text-cyber">$1</a>');
};

function applyFilter() {
    const term = document.getElementById('searchInput')?.value || '';
    const filtered = allData.filter(item => {
        const matchCat = (currentCategory === 'vsetko' || item.kat.toLowerCase() === currentCategory.toLowerCase());
        const searchContent = `${item.meno} ${item.lok} ${item.popis}`.toLowerCase();
        return matchCat && searchContent.includes(term.toLowerCase());
    });
    renderCards(filtered);
}

window.setCategory = (cat) => {
    currentCategory = cat;
    applyFilter();
};

window.copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url);
    alert("[ LINK SKOPÍROVANÝ ]");
};