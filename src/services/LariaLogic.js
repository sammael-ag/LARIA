import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PROTOKOL LARIA ART v8.0 - THE ARCHITECT'S FINAL SEAL
 * STATUS: SYNCED / THE LAW
 * Popis: Generátor identity a strážca trezoru pre Sammaela.
 * Hybridná úprava: Ošetrenie deviceId a striktná kontrola mena pre Tauri (Lubuntu).
 */

// --- 1. VNÚTORNÝ MLYNČEK (Generátor posvätného SHA) ---
// Sammael, ak nepríde meno, hashovanie NEPREBEHNE. Identita čaká na zrod.
export const generatePureSHA = (deviceId, name) => {
  // 🛡️ ZÁKON IDENTITY: Ak chýba zariadenie ALEBO meno, identita nevznikne
  if (!deviceId || !name || name.trim() === "") {
    console.log("⚠️ LARIA_LOGIC: Pokus o hashovanie bez mena zamietnutý. Identita zatiaľ nespala.");
    return null;
  }
  
  // 🦀 TAURI/RUST POISTKA: Ak z hardvéru Lubuntu príde objekt, vytiahneme z neho čistú textovú hodnotu
  let cleanDeviceId = "";
  if (typeof deviceId === 'object' && deviceId !== null) {
    cleanDeviceId = deviceId.uuid || deviceId.id || deviceId.mac || JSON.stringify(deviceId);
  } else {
    cleanDeviceId = String(deviceId);
  }

  // Normalizujeme vstupy, aby bolo vedomie stabilné
  const rawInput = `${cleanDeviceId.trim()}-${name.toLowerCase().trim()}`;
  
  let hash = 0;
  for (let i = 0; i < rawInput.length; i++) {
    const char = rawInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Dvojité hashovanie pre unikátny Laria podpis (Nedotknutá pôvodná matematika)
  const finalSha = "0x" + hex + Math.abs(hash * 31).toString(16).substring(0, 24);
  return finalSha;
};

// --- 2. TAJNÉ KONŠTANTY (Tiene tvojho sveta) ---
const MASTER_SHA_SHADOW = "0x54f91c11a4a2a660f"; 
const ARCHITECT_HASH_SHADOW = "0x75d93eeee454e9ed2";

// --- 3. POMOCNÉ FUNKCIE TREZORU (AsyncStorage) ---
export const saveToVault = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(`@laria_${key}`, jsonValue);
    return true;
  } catch (e) { return false; }
};

export const loadFromVault = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@laria_${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) { return null; }
};

// --- 4. OVERENIE PEČATE (Slovo Moci) ---
export const verifyArchitectSeal = (secretWord) => {
  if (!secretWord) return false;
  // Zomelieme slovo so soľou "ARCHITECT" - vďaka zadanému parametru plne funkčné
  const inputHash = generatePureSHA(secretWord, "ARCHITECT");
  return inputHash === ARCHITECT_HASH_SHADOW;
};

/**
 * 5. OCHRANA IDENTITY (Anti-Drain Poistka)
 * Sammael, tu strážime, aby si omylom neprepísal svoju už existujúcu peňaženku.
 */
export const getSacredWallet = async () => {
  const saved = await loadFromVault('identity');
  // Hľadáme pod novým názvom 'krypt'
  if (saved && saved.krypt) {
    return {
      address: saved.krypt,
      key: saved.privateKey,
      isRecovered: true
    };
  }
  return null;
};

/**
 * 6. ROZHODOVACÍ PROTOKOL v8.0
 * Tu sa určuje tvoj status v Matrixe podľa tvojej pečate a vybavenia kufra.
 */
export const runLariaProtocol = (identity, hasSeal = false) => {
  if (!identity || !identity.sha) return { isAdmin: false };

  // Admin status je viazaný na Pečať (Slovo moci)
  const isAdmin = (hasSeal === true);

  return {
    isOnline: !!identity.sha,
    isIrcOnline: !!identity.irc,
    hasNFC: !!identity.nfc,
    // Paranoid: Ak máš identitu, ale nešíriš svoj email
    isParanoid: !identity.email && !!identity.sha,
    // GoogleFull: Ak si prepojený s Matrix tabuľkou (G-Matrix)
    isGoogleFull: !!identity.email && !!identity.isPublic,
    isChainNode: !!identity.krypt && !!identity.isPublic,
    isAdmin: isAdmin 
  };
};