/**
 * LARIA WEB ENGINE - DYNAMICKÉ ČAKRY (LOGIC v4.3 - FINAL ALIGNMENT)
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbwYrkLCil1BmJhP7nMgBeJnhqDBe5nTDWhlErjHolLjG-zJjit3sKA_69E-IBEM1vtY/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. KYBERNETICKÝ MOST (APP SYNC) ---
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
        alert("Pre uloženie vizitky použi appku LARIA.");
    }
}

// --- 2. LOGIKA A FORMÁTOVANIE ---
const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

const aktivujOdkazy = (text) => {
    if (!text) return "";
    let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return safeText.replace(urlPattern, '<a href="$1" target="_blank" class="text-cyber">$1</a>');
};

// --- 3. NAČÍTANIE DÁT (OPRAVENÉ MAPOVANIE) ---
async function loadDataFromGSheets() {
    try {
        const response = await fetch(READ_URL);
        if (!response.ok) throw new Error("Matrix neodpovedá");
        
        const rawData = await response.json();
        console.log("Dáta načítané, počet riadkov:", rawData.length);

        allData = rawData.map(row => {
        // row[12] je tvoj 'true' - musíme ho brať taký, aký je
        const publicStatus = row[12]; 

    return {
        id: row[1] || "no-sha",
        datum: row[2],
        meno: row[3] || "Neznámy Majster",
        kat: row[4] || "Všeobecné",
        lok: row[5] || "Neznáma lokalita",
        popis: row[6] || "",
        tel: row[7] ? row[7].toString().trim() : "",
        email: row[8] || "",
        fb: row[9] || "",
        tg: row[10] || "",
        gal: row[11] || "",
        // TOTO JE OPRAVA: Prijme 'true' ako boolean aj ako text "TRUE"
        isPublic: publicStatus === true || String(publicStatus).toUpperCase() === "TRUE"
    };}).filter(item => item.isPublic === true);

        applyFilter();
    } catch (e) {
        console.error("Matrix offline:", e);
        document.getElementById('cards-container').innerHTML = '<p style="color:red">Chyba pripojenia k Matrixu...</p>';
    }
}

// --- 4. MINIMALISTICKÝ RENDER ---
function renderCards(data) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="text-cyber">Ticho v éteri... (žiadne verejné vizitky)</p>';
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

// --- 5. FILTRÁCIA ---
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

// --- 6. GLOBÁLNE FUNKCIE ---
window.setCategory = (cat) => {
    currentCategory = cat;
    // Ak máš v HTML prepínače kategórií, tu môžeš pridať vizuálny "active" stav
    applyFilter();
};

window.copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => alert("Odkaz skopírovaný do schránky."));
};

// Štart systému
window.onload = loadDataFromGSheets;