import { registerRootComponent } from 'expo';
import App from './App';

// 📍 1. FIX PRE LOCALSTORAGE (Toto musí byť úplne hore!)
if (typeof window !== 'undefined') {
  console.log("🛠️ Sammael: Kontrolujem pripravenosť dielne (LocalStorage)...");
  
  // Ak by náhodou Electron štrajkoval, podhodíme mu pamäťovú verziu
  if (!window.localStorage) {
    console.warn("⚠️ LocalStorage chýba! Vytváram núdzový úložný priestor...");
    const storage = {};
    window.localStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => { storage[key] = value.toString(); },
      removeItem: (key) => { delete storage[key]; },
      clear: () => { for (let key in storage) delete storage[key]; },
      length: Object.keys(storage).length,
      key: (i) => Object.keys(storage)[i] || null
    };
  } else {
    console.log("✅ LocalStorage je prítomný a funkčný.");
  }
}

// 📍 2. LOG PRE KONTROLU
console.log("🚀 Sammael, som v index.js a registrujem App pre Electron!");

// Registrácia
registerRootComponent(App);