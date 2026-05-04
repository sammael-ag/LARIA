/**
 * LARIA WEB ENGINE - DYNAMICKÉ ČAKRY
 * LOGIC v4.4 - Špecializované pre Renderer v7.0
 * Čistý kód bez džabania.
 */

// TU VLOŽ SVOJU NOVÚ URL Z RENDERER SKRIPTU
const READ_URL = "https://script.google.com/macros/s/AKfycbxBcijYrg4MZNwz8zP2Qi91rn-EgcFdG18b50HGc4_BhTnpe2paXqI6WiJP9NN5UenP/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. NAČÍTANIE DÁT (SYNERGIA S RENDEREROM v7.0) ---
async function loadDataFromGSheets() {
    console.log("🚀 Matrix: Štartujem sťahovanie dát...");
    try {
        const response = await fetch(READ_URL);
        if (!response.ok) throw new Error("Matrix neodpovedá");
        
        // Renderer v7.0 posiela pole objektov, kde kľúče sú názvy stĺpcov (malými písmenami)
        const rawData = await response.json();
        console.log("✅ Dáta načítané, počet záznamov:", rawData.length);

        allData = rawData.map(item => {
            // Každý kľúč zodpovedá názvu stĺpca v G-Tab (status, sha, meno, kat...)
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
                // Akceptujeme boolean aj textovú verziu z tabuľky
                isPublic: publicStatus === true || String(publicStatus).toUpperCase() === "TRUE"
            };
        }).filter(item => item.isPublic === true); // Ukážeme len tie, čo majú PUBLIC = TRUE

        applyFilter();
    } catch (e) {
        console.error("❌ Matrix offline:", e);
        const container = document.getElementById('cards-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 50px;">
                    <p style="color:#F0F; font-family:monospace;">[ CHYBA_SPOJENIA_S_MATRIXOM ]</p>
                    <p style="color:#555; font-size:12px;">${e.message}</p>
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
        container.innerHTML = '<p class="text-cyber" style="text-align:center; width:100%;">Ticho v éteri... (žiadne verejné vizitky)</p>';
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
        alert("Pre uloženie vizitky otvor tento web v appke LARIA.");
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
    // Vizuálna odozva (voliteľné: tu môžeš pridať triedu .active na tlačidlá)
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

// INICIALIZÁCIA
window.onload = loadDataFromGSheets;