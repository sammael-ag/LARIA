/**
 * LARIA WEB ENGINE - BEZPEČNÁ ČAKRA v6.2
 * LOGIC: Dual-ID Mapping & Correct Payload Naming
 * FIX: Zjednotenie kľúčov pre bezchybné pridávanie kontaktov
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. ŠTART A INTELIGENTNÉ OTVÁRANIE ---
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id'); 
    
    await loadDataFromGSheets(targetId);

    // Ak prišiel cez priamy odkaz (QR/NFC), po krátkej pauze aktivujeme most
    if (targetId) {
        setTimeout(() => {
            const item = allData.find(i => 
                i.id === targetId || 
                (i.wallet && i.wallet.toLowerCase() === targetId.toLowerCase())
            );
            if (item) smartAdd(item.id); 
        }, 1200); 
    }
};

// --- 2. NAČÍTANIE DÁT ---
async function loadDataFromGSheets(targetId = null) {
    console.log("🚀 Matrix: Synchronizácia dát...");
    const container = document.getElementById('cards-container');
    
    try {
        const response = await fetch(READ_URL);
        const textData = await response.text();
        let rawData = JSON.parse(textData);

        allData = rawData.map(item => {
            const fingerprint = item.sha ? item.sha.substring(0, 12) : "no-sha";
            
            return {
                id: fingerprint,        // Krátke ID pre web/URL
                fullSha: item.sha,      // Plné SHA pre unikátnosť v appke
                meno: item.meno || "Neznámy Majster",
                kategoria: item.kat || "ine", // Tu fixujeme názov na 'kategoria'
                lok: item.lok || "V sieti",
                popis: item.popis || "",
                gal: item.gal || "", 
                wallet: item.krypt || "", // Odkladáme si krypt adresu
                isPublic: item.public === true || String(item.public).toUpperCase() === "TRUE"
            };
        }).filter(item => item.isPublic);

        if (targetId) {
            const soloItem = allData.find(i => 
                i.id === targetId || 
                (i.wallet && i.wallet.toLowerCase() === targetId.toLowerCase())
            );
            
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
        if (!isSolo) card.style.cursor = 'pointer';
        
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                window.location.href = `?id=${item.id}`;
            }
        };

        card.innerHTML = `
            <span class="tag">${item.kategoria}</span>
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

// --- 4. MODÁLNY MOST (Kľúčová oprava tu!) ---
function smartAdd(fingerprint) {
    const item = allData.find(i => i.id === fingerprint);
    if (!item) return;

    // PRÍPRAVA BALÍKA PRE APP (Musí ladiť s LariaContext.js a onMessage v appke)
    const payload = {
        sha: item.fullSha,         // Plné ID
        meno: item.meno,           // Tu musí byť 'meno'
        kategoria: item.kategoria, // Tu musí byť 'kategoria'
        lok: item.lok,
        popis: item.popis,
        gal: item.gal,
        krypt: item.wallet         // Mapujeme späť na 'krypt'
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

    fpLabel.innerText = fingerprint;
    
    openAppBtn.onclick = () => {
        window.location.href = `laria://contact/${fingerprint}`;
        closeLariaBridge();
    };

    modal.style.display = 'flex';
}

function closeLariaBridge() {
    const modal = document.getElementById('lariaBridge');
    if (modal) modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('lariaBridge');
    if (event.target == modal) {
        closeLariaBridge();
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
        const matchCat = (currentCategory === 'vsetko' || item.kategoria.toLowerCase() === currentCategory.toLowerCase());
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