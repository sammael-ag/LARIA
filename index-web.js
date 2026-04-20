/**
 * LARIA WEB ENGINE - DYNAMICKÉ ČAKRY (LIVE VERSION)
 */

const READ_URL = "https://script.google.com/macros/s/AKfycbwYrkLCil1BmJhP7nMgBeJnhqDBe5nTDWhlErjHolLjG-zJjit3sKA_69E-IBEM1vtY/exec";

let allData = []; 
let currentCategory = 'vsetko';

// --- 1. POMOCNÉ FUNKCIE (Logika & Formátovanie) ---
const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

const aktivujOdkazy = (text) => {
    if (!text) return "";
    let cistyText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let textSFormatom = cistyText.replace(/\\n/g, "\n");
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    let upravenyText = textSFormatom.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyber">$1</a>');
    const wwwPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    return upravenyText.replace(wwwPattern, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer" class="text-cyber">$2</a>');
};

// --- 2. NAČÍTANIE DÁT Z MATRIXU ---
async function loadDataFromGSheets() {
    console.log("Skenujem Matrix...");
    try {
        const response = await fetch(READ_URL);
        const rawData = await response.json();
        
        // Mapovanie dát z tabuľky (podľa tvojho poradia A-N)
        // Predpokladáme, že prvý riadok sú hlavičky, tak ho preskočíme ak treba
        allData = rawData.map((row, index) => ({
            id: row[0], // SHA ako unikátne ID
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
        })).filter(item => item.isPublic === true || item.isPublic === "TRUE"); // Zobrazíme len tie s "kyslíkom"

        applyFilter();
    } catch (e) {
        console.error("Chyba spojenia s Matrixom:", e);
        const container = document.getElementById('cards-container');
        if (container) container.innerHTML = '<p class="text-dim">Spojenie s Matrixom bolo prerušené...</p>';
    }
}

// --- 3. RENDEROVANIE KARIET ---
function renderCards(data) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="text-dim">V tomto sektore nežiari žiadna čakra...</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${item.id}`;

        card.innerHTML = `
            <span class="tag">${item.kat}</span>
            <div class="card-meno text-white">${item.meno}</div>
            <div class="text-dim" style="font-size: 0.8rem; margin-bottom: 10px;">📍 ${item.lok}</div>
            <div class="text-main" style="margin-bottom: 20px; white-space: pre-line;">${aktivujOdkazy(item.popis)}</div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <a href="tel:${item.tel.replace(/\s/g, '')}" class="btn-action" style="flex: 1; border-color: #0F0; color: #0F0; text-decoration: none; text-align: center; line-height: 2.2;">[ VOLAŤ ]</a>
                <button onclick="copyShareLink('${item.id}')" class="btn-action" style="flex: 1;">[ ZDIEĽAŤ ]</button>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                ${item.tg ? `<a href="${item.tg}" target="_blank" class="text-cyber" style="font-size: 0.8rem;">TELEGRAM</a>` : ''}
                ${item.fb ? `<a href="${item.fb}" target="_blank" class="text-cyber" style="font-size: 0.8rem;">FACEBOOK</a>` : ''}
                ${item.gal ? `<a href="${item.gal}" target="_blank" class="text-cyber" style="font-size: 0.8rem;">GALÉRIA</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. FILTRÁCIA ---
function applyFilter() {
    const searchInput = document.getElementById('searchInput');
    const term = searchInput ? searchInput.value : '';
    
    const filtered = allData.filter(item => {
        const matchCategory = (currentCategory === 'vsetko' || item.kat.toLowerCase() === currentCategory.toLowerCase());
        const content = removeAccents(`${item.meno} ${item.lok} ${item.popis}`.toLowerCase());
        const matchSearch = removeAccents(term.toLowerCase()).length < 2 || content.includes(removeAccents(term.toLowerCase()));
        return matchCategory && matchSearch;
    });

    renderCards(filtered);
}

// --- 5. POMOCNÉ FUNKCIE ---
window.copyShareLink = (id) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => alert("Kód vizitky skopírovaný! ✨"));
};

// --- 6. ŠTART SYSTÉMU ---
window.onload = async () => {
    await loadDataFromGSheets();
};