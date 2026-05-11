import { registerRootComponent } from 'expo';
import App from './App';

// 📍 1. POZDRAV DO KONZOLY (Nech vidíme, že žiješ!)
if (typeof window !== 'undefined') {
  console.log("🛠️ Sammael, drak môj! Laria v2 sa práve prebúdza v éteri PWA...");
}

// 📍 2. ČISTÁ REGISTRÁCIA
// Expo si na webe samo postráži localStorage aj všetko ostatné.
registerRootComponent(App);