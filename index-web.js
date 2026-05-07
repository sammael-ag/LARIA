/**
 * LARIA WEB ENGINE - v9.9.8
 * STATUS: SECURE / UNIFIED HANDSHAKE / AUTO-MODAL ACTIVATED
 * FIX: 3s Auto-trigger pre Solo vizitky, vylepšená navigácia.
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

let allData = []; 
let currentCategory = 'vsetko';

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id'); 
    
    await loadDataFromMatrix(targetId);
};

async function loadDataFromMatrix(targetId = null) {
    const container = document.getElementById('cards-container');
    
    try {
        const response = await fetch(READ_URL);
        const rawData = await response.json();

        allData = rawData.reduce((acc, item) => {
            if (!item.poznamka || item.poznamka.trim() === "") return acc; 

            acc.push({
                sha: item.sha,
                meno: item.meno || "Pútnik",
                kat: item.kat || "Majster",
                lok: item.lok || "V sieti",
                popis: item.popis || "",
                gal: item.gal || "",
                irc: item.irc || "",
                fing: item.poznamka.trim(),
                krypt: item.krypt || ""
            });
            return acc;
        }, []);

        if (targetId) {
            const soloItem = allData.find(i => i.fing === targetId || i.krypt === targetId);
            if (soloItem) {
                renderCards([soloItem], true);
                return;
            }
        }
        applyFilter();
    } catch (e) {
        if (container) container.innerHTML = `<p style="color:#0FF; text-align:center; padding:50px;">[ SYSTÉMOVÁ_CHYBA_MATRIXU ]</p>`;
    }
}

// --- 3. RENDER KARIET (S automatickým časovačom) ---
function renderCards(data, isSolo = false) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (isSolo) {
        container.innerHTML = `
            <div style="width: 100%; max-width: 500px; margin: 0 auto;">
                <button onclick="window.location.href='index.html'" class="btn-share" style="margin-bottom: 25px; width:100%; border-color:#0FF; color:#0FF; background:transparent; cursor:pointer;">
                    [ ↩ SPÄŤ DO SIETE ]
                </button>
            </div>`;
            
        // --- ⚡ AUTO-TRIGGER (3 SEKUNDY) ---
        // Ak je to sólo vizitka v prehliadači, po 3 sekundách ponúkneme appku
        if (!window.ReactNativeWebView) {
            setTimeout(() => {
                console.log("🚀 LARIA: Automatické vyvolanie mosta...");
                smartAdd(data[0].fing);
            }, 3000);
        }
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = isSolo ? 'card card-solo' : 'card';
        
        card.onclick = (e) => {
            if (!isSolo && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                window.location.href = `?id=${item.fing}`;
            }
        };

        card.innerHTML = `
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <span class="tag" style="background: rgba(0, 255, 255, 0.1); color: #0FF; border: 1px solid #0FF;">${item.kat}</span>
                <span style="color: #444; font-size: 9px;">FING: ${item.fing}</span>
            </div>
            <h2 class="card-title" style="margin: 15px 0 5px 0;">${item.meno}</h2>
            <p class="card-loc" style="color: #888; font-size: 0.9em;">📍 ${item.lok}</p>
            <p class="card-desc" style="margin: 15px 0;">${aktivujOdkazy(item.popis)}</p>
            
            <div class="card-actions" style="display: flex; gap: 10px;">
                <button onclick="smartAdd('${item.fing}')" class="btn-add" style="flex: 2; background: #0FF; color: #000; font-weight: bold; border: none; padding: 10px; cursor:pointer;">[ DO APPKY ]</button>
                <button onclick="copyShareLink('${item.fing}')" class="btn-share" style="flex: 1; color: #0FF; border: 1px solid #0FF; background: transparent; cursor:pointer;">[ LINK ]</button>
            </div>

            ${item.gal ? `
            <div style="margin-top: 15px; border-top: 1px solid #222; padding-top: 10px;">
                <a href="${item.gal}" target="_blank" style="color: #0FF; font-size: 11px; text-decoration: none;">[ 🖼️ GALÉRIA ARTEFAKTOV ]</a>
            </div>` : ''}
        `;
        container.appendChild(card);
    });
}

function smartAdd(fingId) {
    const item = allData.find(i => i.fing === fingId);
    if (!item) return;

    const payload = {
        fing: item.fing,
        meno: item.meno,
        krypt: item.krypt,
        kat: item.kat,
        sha: item.sha,
        lok: item.lok,
        popis: item.popis,
        gal: item.gal,
        v: "9.9.8"
    };

    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'ADD_CONTACT', 
            payload: payload 
        }));
    } else {
        const modal = document.getElementById('lariaBridge');
        if (modal) {
            // Ak je už modal otvorený, nebudeme ho "preblikávať"
            if (modal.style.display === 'flex') return;

            document.getElementById('modal-fingerprint').innerText = fingId;
            document.getElementById('btn-open-app').onclick = () => {
                window.location.href = `laria://id/${item.fing}`;
                modal.style.display = 'none';
            };
            modal.style.display = 'flex';
        }
    }
}

const aktivujOdkazy = (text) => {
    if (!text) return "Bez popisu.";
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, '<a href="$1" target="_blank" style="color: #0FF;">$1</a>');
};

function applyFilter() {
    const term = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filtered = allData.filter(item => {
        const matchCat = (currentCategory === 'vsetko' || item.kat.toLowerCase() === currentCategory.toLowerCase());
        const searchContent = `${item.meno} ${item.lok} ${item.popis} ${item.fing}`.toLowerCase();
        return matchCat && searchContent.includes(term);
    });
    renderCards(filtered);
}

window.setCategory = (cat) => {
    currentCategory = cat;
    applyFilter();
};

window.copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => alert("[ LINK ULOŽENÝ ]"));
};