/**
 * LARIA: Jazykové jadro (L-Core) & Native Bridge
 */

// 1. Nastavenia a predvolený jazyk
const config = {
    fallbackLang: 'en',
    currentLang: navigator.language.split('-')[0] || 'sk'
};

// --- NATIVE BRIDGE: Tvoje otvorené dvere k hardvéru ---
const LariaNative = {
    async callHelper(command) {
        console.log(`Laria: Klopem Gopherovi na dvere s povelom: ${command}`);
        try {
            // Service Worker (sw.js) tento fetch zachytí a pošle ho do main.go
            const response = await fetch('/api/native'); 
            const data = await response.text();
            return data;
        } catch (err) {
            console.error("Laria Bridge Error:", err);
            return "Dvere sú zamknuté (Helper nebeží)";
        }
    }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Laria: Service Worker pripravený!', reg))
      .catch(err => console.log('Laria: Service Worker zlyhal...', err));
  });
}

// 2. Náš lokálny buffer prekladov
let dictionary = {
    'sk': {
        'app_name': 'LARIA',
        'loading': 'Načítavam svetlo...',
        'welcome_msg': 'Vitaj v novej realite, Sammael',
        'btn_enter': 'Vstúpiť do systému (DZIG)',
        'footer_info': 'Rákoš | Art Deco | 2026'
    },
    'en': {
        'app_name': 'LARIA',
        'loading': 'Loading light...',
        'welcome_msg': 'Welcome to the new reality, Sammael',
        'btn_enter': 'Enter System (DZIG)',
        'footer_info': 'Rakos | Art Deco | 2026'
    }
};

// 3. Hlavná prekladová funkcia "t" (Translate)
function t(key) {
    const lang = config.currentLang;
    return (dictionary[lang] && dictionary[lang][key]) 
           || (dictionary[config.fallbackLang] && dictionary[config.fallbackLang][key]) 
           || `[[${key}]]`;
}

// 4. Funkcia na vykreslenie (Render)
async function render() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="main-container">
            <header>
                <h1 class="logo">${t('app_name')}</h1>
            </header>
            
            <main class="content">
                <h2>${t('welcome_msg')}</h2>
                <div id="gopher-response" style="margin-bottom: 20px; color: #ffd700; font-style: italic;">
                    </div>
                <button class="primary-btn" id="enter-btn">${t('btn_enter')}</button>
            </main>

            <footer>
                <p class="status-text">${t('footer_info')}</p>
            </footer>
        </div>
    `;

    document.getElementById('enter-btn').onclick = async () => {
        const display = document.getElementById('gopher-response');
        display.innerText = "Klopem na bránu...";
        
        // --- PRVÝ SKUTOČNÝ DZIG ---
        const msg = await LariaNative.callHelper('hello');
        display.innerText = msg;
    };
}

// Spustíme to
render();