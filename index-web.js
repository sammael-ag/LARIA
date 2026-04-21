/**
 * LARIA WEB ENGINE - DYNAMICKÉ ČAKRY (LOGIC FIRST)
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

// --- 3. NAČÍTANIE DÁT ---
async function loadDataFromGSheets() {
    try {
        const response = await fetch(READ_URL);
        const rawData = await response.json();
        
        allData = rawData.map(row => ({
            id: row[0],
            datum: row[1],
            meno: row[2],
            kat: row[3],
            lok: row[4],
            popis: row[5],
            tel: row[6] ? row[6].toString() : "",
            email: row[7],
            fb: row[8],
            tg: row[9],
            gal: row[10],
            isPublic: row[11]
        })).filter(item => item.isPublic === true || item.isPublic === "TRUE");

        applyFilter();
    } catch (e) {
        console.error("Matrix offline:", e);
    }
}

// --- 4. MINIMALISTICKÝ RENDER ---
function renderCards(data) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = data.length === 0 ? '<p>Ticho v éteri...</p>' : '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Čistá štruktúra bez nánosov štýlov
        card.innerHTML = `
            <span class="tag">${item.kat}</span>
            <h2 class="card-title">${item.meno}</h2>
            <p class="card-loc">📍 ${item.lok}</p>
            <p class="card-desc">${aktivujOdkazy(item.popis)}</p>
            
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
        const matchCat = (currentCategory === 'vsetko' || item.kat.toLowerCase() === currentCategory.toLowerCase());
        const content = removeAccents(`${item.meno} ${item.lok} ${item.popis}`.toLowerCase());
        return matchCat && (term.length < 2 || content.includes(removeAccents(term.toLowerCase())));
    });
    renderCards(filtered);
}

// --- 6. GLOBÁLNE FUNKCIE ---
window.copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => alert("Kód skopírovaný."));
};

window.onload = loadDataFromGSheets;