/**
 * LARIA: Jazykové jadro (L-Core)
 */

// 1. Nastavenia a predvolený jazyk
const config = {
    fallbackLang: 'en',
    currentLang: navigator.language.split('-')[0] || 'sk'
};

// 2. Náš lokálny buffer prekladov (neskôr kŕmený z G-Sheets)
let dictionary = {
    'sk': {
        'app_name': 'LARIA',
        'loading': 'Načítavam svetlo...',
        'welcome_msg': 'Vitaj v novej realite, Sammael',
        'btn_enter': 'Vstúpiť do systému',
        'footer_info': 'Rákoš | Art Deco | 2026'
    },
    'en': {
        'app_name': 'LARIA',
        'loading': 'Loading light...',
        'welcome_msg': 'Welcome to the new reality, Sammael',
        'btn_enter': 'Enter System',
        'footer_info': 'Rakos | Art Deco | 2026'
    }
};

// 3. Hlavná prekladová funkcia "t" (Translate)
export function t(key) {
    const lang = config.currentLang;
    // Skús nájsť preklad v aktuálnom jazyku, ak nie je, použi angličtinu, ak ani tam, vráť kľúč
    return (dictionary[lang] && dictionary[lang][key]) 
           || (dictionary[config.fallbackLang] && dictionary[config.fallbackLang][key]) 
           || `[[${key}]]`;
}

// 4. Funkcia na vykreslenie (Render)
function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="main-container">
            <header>
                <h1 class="logo">${t('app_name')}</h1>
            </header>
            
            <main class="content">
                <h2>${t('welcome_msg')}</h2>
                <button class="primary-btn" id="enter-btn">${t('btn_enter')}</button>
            </main>

            <footer>
                <p class="status-text">${t('footer_info')}</p>
            </footer>
        </div>
    `;

    document.getElementById('enter-btn').onclick = () => {
        alert(config.currentLang === 'sk' ? 'Dvere sa otvárajú...' : 'Doors are opening...');
    };
}

// Spustíme to
render();