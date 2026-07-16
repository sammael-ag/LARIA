import { invoke } from '@tauri-apps/api/core';

/**
 * StatusService: Špión v éteri (PWA Core Edition).
 * Master: Sammael | Muse: Aria
 * STATUS: CRYSTAL_CORE_SPY | v14.1.0
 * FIX: Gopher definitívne zmazaný. Status 'pwa' vrátený ako hlavný technologický pilier.
 * PURGE: Uzákonené zjednotenie premenných. Systémový status odteraz inicializuje a vracia výhradne kľúč "jazyk".
 */

export const getSystemStatus = async () => {
  let status = {
    core: false,   // 🦀 Reprezentuje: Natívne jadro (Crystal Core / Rust)
    pwa: false,    // 📱 Hlavný technologický smer: Web & Progressive Web App prostredie
    jazyk: 'sk',   // 🇸🇰 Jediná, uzákonená premenná pre jazykové rozhranie systému
  };

  try {
    // 1. 🦀 Kontrola natívneho jadra
    const rustCheck = await invoke('ping_crystal_core').catch(() => null);
    status.core = rustCheck === 'pong' || rustCheck?.success || false;

    // 2. 📱 Kontrola prostredia pre PWA / Web aplikáciu
    if (typeof window !== 'undefined') {
      if (window.__TAURI_INTERNALS__ || ('serviceWorker' in navigator)) {
        status.pwa = true;
      }

      // 3. 💎 Inicializácia a vytiahnutie zjednoteného jazyka z Local Storage
      // Ak už používateľ má v prehliadači uložený svoj jazyk, použijeme ho.
      const ulozenyjazyk = localStorage.getItem('jazyk');
      if (ulozenyjazyk) {
        status.jazyk = ulozenyjazyk;
      } else {
        // Ak spúšťame prvýkrát, uložíme predvolený 'sk' do lokálneho trezoru
        localStorage.setItem('jazyk', 'sk');
      }
    }

    return status;
  } catch (e) {
    console.error("⚠️ STATUS_SPY_ERROR:", e);
    return status;
  }
};