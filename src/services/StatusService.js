import { invoke } from '@tauri-apps/api/core';

/**
 * StatusService: Špión v éteri (Tauri Native Edition).
 * Master: Sammael | Muse: Aria
 * STATUS: CRYSTAL_CORE_SPY
 * FIX: Odstránený starý Gopher (main.go) a webový Service Worker.
 * Teraz natívne kontroluje zdravie Rust jadra pod Lubuntu.
 */

export const getSystemStatus = async () => {
  let status = {
    gopher: false, // V UI reprezentuje: Natívne jadro (Teraz Rust / Crystal Core)
    pwa: false,    // V UI reprezentuje: Desktopové Tauri prostredie
  };

  try {
    // 1. 🦀 Kontrola Rust jadra namiesto starého Gophera
    // Pingneme Rust cez Tauri invoke. Ak odpovie, jadro žije.
    const rustCheck = await invoke('ping_crystal_core').catch(() => null);
    status.gopher = rustCheck === 'pong' || rustCheck?.success || false;

    // 2. Kontrola, či bezpečne bežíme v Tauri okne (Desktop mode)
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      status.pwa = true;
    }

    return status;
  } catch (e) {
    console.error("⚠️ STATUS_SPY_ERROR:", e);
    return status;
  }
};