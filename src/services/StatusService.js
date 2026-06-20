import { invoke } from '@tauri-apps/api/core';

/**
 * StatusService: Špión v éteri (PWA Core Edition).
 * Master: Sammael | Muse: Aria
 * STATUS: CRYSTAL_CORE_SPY | v14.0.1
 * FIX: Gopher definitívne zmazaný. Status 'pwa' vrátený ako hlavný technologický pilier.
 * WEB + PWA ostáva naším základným smerom, všetko ostatné je periféria.
 */

export const getSystemStatus = async () => {
  let status = {
    core: false,   // 🦀 Reprezentuje: Natívne jadro (Crystal Core / Rust)
    pwa: false,    // 📱 Hlavný technologický smer: Web & Progressive Web App prostredie
  };

  try {
    // 1. 🦀 Kontrola natívneho jadra
    // Pingneme Rust cez Tauri invoke. Ak odpovie, jadro žije.
    const rustCheck = await invoke('ping_crystal_core').catch(() => null);
    status.core = rustCheck === 'pong' || rustCheck?.success || false;

    // 2. 📱 Kontrola prostredia pre PWA / Web aplikáciu
    // Sme vo webovom okne a overujeme prítomnosť Tauri ako doplnkovej periférie,
    // no výsledný stav reprezentuje pripravenosť nášho PWA smeru.
    if (typeof window !== 'undefined') {
      // Ak bežíme v Tauri alebo máme nadviazané bezpečné webové prostredie
      if (window.__TAURI_INTERNALS__ || ('serviceWorker' in navigator)) {
        status.pwa = true;
      }
    }

    return status;
  } catch (e) {
    console.error("⚠️ STATUS_SPY_ERROR:", e);
    return status;
  }
};