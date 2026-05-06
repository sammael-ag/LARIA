/**
 * LARIA WEB ENGINE - BEZPEČNÁ ČAKRA v5.4
 * LOGIC: Minimalistická vizitka (Motivácia k inštalácii app)
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

let allData = []; 

// --- 1. ŠTART ---
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id'); 
    await loadDataFromGSheets(targetId);
};

// --- 2. NAČÍTANIE DÁT (Očistené o súkromné údaje) ---
async function loadDataFromGSheets(targetId = null) {
    console.log("🚀 Matrix: Synchronizácia verejných dát...");
    try {
        const response = await fetch(READ_URL);
        const rawData = await response.json();

        allData = rawData.map(item => {
            // Unikátny 12-znakový fingerprint pre URL
            const fingerprint = item.sha ? item.sha.substring(0, 12) : "no-id";

            return {
                id: fingerprint,
                fullSha: item.sha, 
                meno: item.meno || "Neznámy Majster",
                kat: item.kat || "HĽADAČ SLOBODY",
                lok: item.lok || "V SIETI",
                popis: item.popis || "",
                gal: item.gal || "", // Galéria je jediný povolený externý link
                isPublic: String(item.public).toUpperCase() === "TRUE"
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
        console.error("❌ Matrix Error:", e);
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
        
        // Kliknutím na kartu sa zobrazí jej samostatný detail
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
                ${item.gal ? `<a href="${item.gal}" target="_blank" style="color: #FF0;">[ FOTOGALÉRIA ARTEFAKTOV ]</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. INTELIGENTNÝ MOST (Odosiela SHA len do appky) ---
function smartAdd(fingerprint) {
    const item = allData.find(i => i.id === fingerprint);
    if (!item) return;

    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'ADD_CONTACT', 
            payload: { ...item, id: item.fullSha } 
        }));
        return;
    }

    // Pokus o otvorenie nainštalovanej appky
    window.location.href = `laria://contact/${item.id}`;

    // Ak appka nereaguje, ponúkneme inštaláciu
    setTimeout(() => {
        if (document.hasFocus()) showInstallModal(item.id);
    }, 1500);
}

function showInstallModal(id) {
    const msg = `[ LARIA PROTOKOL: OBMEDZENÝ PRÍSTUP ]\n\nPre zobrazenie kontaktu a šifrovanú komunikáciu si musíš nainštalovať aplikáciu LARIA.\n\nChceš prejsť na stiahnutie (Android/Ubuntu)?`;
    if (confirm(msg)) {
        window.location.href = "download.html?id=" + id;
    }
}

// --- 5. POMOCNÉ FUNKCIE ---
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