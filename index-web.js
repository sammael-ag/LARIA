/**
 * LARIA WEB ENGINE - BEZPEČNÁ ČAKRA v8.0
 * STATUS: SYNCED / THE LAW
 * FIX: Jednotné premenné podľa protokolu (sha, kat, krypt, lok...)
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. ŠTART ---
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id'); 
    
    await loadDataFromGSheets(targetId);

    if (targetId) {
        setTimeout(() => {
            // Hľadáme podľa krátkeho ID alebo krypt peňaženky
            const item = allData.find(i => 
                i.fingerprint === targetId || 
                (i.krypt && i.krypt.toLowerCase() === targetId.toLowerCase())
            );
            if (item) smartAdd(item.fingerprint); 
        }, 1200); 
    }
};

// --- 2. NAČÍTANIE DÁT Z MATRIXU ---
async function loadDataFromGSheets(targetId = null) {
    console.log("🚀 Matrix: Synchronizácia dát podľa protokolu v8.0...");
    const container = document.getElementById('cards-container');
    
    try {
        const response = await fetch(READ_URL);
        const rawData = await response.json();

        allData = rawData.map(item => {
            // Krátky vizuálny kľúč pre web
            const shortId = item.sha ? item.sha.substring(0, 12) : "no-sha";
            
            return {
                fingerprint: shortId,    // Len pre URL a UI
                sha: item.sha,          // POSVÄTNÉ PLNÉ SHA
                meno: item.meno || "Pútnik",
                kat: item.kat || "Majster",
                lok: item.lok || "V sieti",
                popis: item.popis || "",
                gal: item.gal || "", 
                krypt: item.krypt || "", 
                isPublic: item.ispublic === true || String(item.ispublic).toUpperCase() === "TRUE"
            };
        }).filter(item => item.isPublic);

        if (targetId) {
            const soloItem = allData.find(i => i.fingerprint === targetId || i.krypt === targetId);
            if (soloItem) {
                renderCards([soloItem], true);
                return;
            }
        }
        applyFilter();
    } catch (e) {
        console.error("❌ Matrix offline:", e);
        if (container) container.innerHTML = `<p style="color:#F0F; text-align:center; padding:50px;">[ CHYBA_MATRIXU ]</p>`;
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

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = isSolo ? 'card card-solo' : 'card';
        
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                window.location.href = `?id=${item.fingerprint}`;
            }
        };

        card.innerHTML = `
            <span class="tag">${item.kat}</span>
            <h2 class="card-title">${item.meno}</h2>
            <p class="card-loc">📍 ${item.lok}</p>
            <p class="card-desc">${aktivujOdkazy(item.popis)}</p>
            
            <div class="card-actions">
                <button onclick="smartAdd('${item.fingerprint}')" class="btn-add">[ PRIDAŤ ]</button>
                <button onclick="copyShareLink('${item.fingerprint}')" class="btn-share">[ LINK ]</button>
            </div>

            <div class="card-links">
                ${item.gal ? `<a href="${item.gal}" target="_blank" style="color: #FF0; font-size: 10px;">[ GALÉRIA ARTEFAKTOV ]</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. MODÁLNY MOST (Smer do Appky) ---
function smartAdd(shortId) {
    const item = allData.find(i => i.fingerprint === shortId);
    if (!item) return;

    // BALÍK PRESNE PODĽA PROTOKOLU
    const payload = {
        sha: item.sha,      // Celá pečať
        meno: item.meno,
        kat: item.kat,
        lok: item.lok,
        popis: item.popis,
        gal: item.gal,
        krypt: item.krypt
    };

    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'ADD_CONTACT', 
            payload: payload 
        }));
        return;
    }

    const modal = document.getElementById('lariaBridge');
    const fpLabel = document.getElementById('modal-fingerprint');
    const openAppBtn = document.getElementById('btn-open-app');

    if (!modal) return;

    fpLabel.innerText = shortId;
    openAppBtn.onclick = () => {
        window.location.href = `laria://contact/${shortId}`;
        closeLariaBridge();
    };

    modal.style.display = 'flex';
}

function closeLariaBridge() {
    const modal = document.getElementById('lariaBridge');
    if (modal) modal.style.display = 'none';
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