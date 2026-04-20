import { fetchGMatrix } from './services/GMatrixService';
/**
 * LARIA WEB ENGINE - DYNAMICKÉ ČAKRY & FILTRÁCIA
 * Tento skript obsluhuje Náš web (index.html)
 */

// --- 1. DÁTA (Zatiaľ statické, pripravené na G-Table) ---
let allData = []; 
let currentCategory = 'vsetko';

// --- 2. TVOJA OVERENÁ LOGIKA (Extrahovaná) ---
const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const aktivujOdkazy = (text) => {
    if (!text) return "";
    let cistyText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let textSFormatom = cistyText.replace(/\\n/g, "\n");
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    let upravenyText = textSFormatom.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyber">$1</a>');
    const wwwPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    return upravenyText.replace(wwwPattern, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer" class="text-cyber">$2</a>');
};

// --- 3. RENDEROVANIE KARIET (Tento šat sme ladili) ---
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

        // Tu spájame tvoj vizuál z styles.css s dátami
        card.innerHTML = `
            <span class="tag">${item.kat}</span>
            <div class="card-meno text-white">${item.meno}</div>
            <div class="text-dim" style="font-size: 0.8rem; margin-bottom: 10px;">📍 ${item.lok}</div>
            <div class="text-main" style="margin-bottom: 20px; white-space: pre-line;">${aktivujOdkazy(item.popis)}</div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <a href="tel:${item.tel.replace(/\s/g, '')}" class="btn-action" style="flex: 1; border-color: #0F0; color: #0F0;">[ VOLAŤ ]</a>
                <button onclick="copyShareLink(${item.id})" class="btn-action" style="flex: 1;">[ ZDIEĽAŤ ]</button>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center;">
                ${item.tg ? `<a href="${item.tg}" target="_blank" class="text-cyber" style="font-size: 0.8rem;">TELEGRAM</a>` : ''}
                ${item.fb ? `<a href="${item.fb}" target="_blank" class="text-cyber" style="font-size: 0.8rem;">FACEBOOK</a>` : ''}
                ${item.gal ? `<a href="${item.gal}" target="_blank" class="text-cyber" style="font-size: 0.8rem;">GALÉRIA</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. FILTRÁCIA (Aplikovanie tvojho mozgu) ---
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
    // Sem neskôr vložíme ten fetch z Google Tabuľky
    // Zatiaľ simulujeme prázdne pole alebo testovacie dáta
    console.log("LARIA WEB ENGINE READY");
    // loadDataFromGSheets(); // To bude naša ďalšia výzva!
};