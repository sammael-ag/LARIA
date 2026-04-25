import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PROTOKOL LARIA ART v2.1 - PURE INTERNAL LOGIC
 * Bez externých knižníc, čistá digitálna alchýmia.
 */

// --- 1. VNÚTORNÝ MLYNČEK (Vlastný Hash algoritmus) ---
const generatePureSHA = (deviceId, name = "Sammael") => {
  if (!deviceId) return null;
  
  const rawInput = `${deviceId}-${name.toLowerCase()}`;
  
  // Jednoduchý, ale efektívny hashing (djb2 upravený)
  let hash = 0;
  for (let i = 0; i < rawInput.length; i++) {
    const char = rawInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Prevod na 32bit integer
  }
  
  // Prevod na hexadecimálny reťazec (aby to vyzeralo ako krypto)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const finalSha = "0x" + hex + Math.abs(hash * 31).toString(16).substring(0, 24);
  
  return finalSha;
};

// --- 2. ULOŽENIE DO TREZORU ---
export const saveToVault = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(`@laria_${key}`, jsonValue);
    return true;
  } catch (e) {
    console.error("Chyba pri ukladaní do trezoru:", e);
    return false;
  }
};

// --- 3. NAČÍTANIE Z TREZORU ---
export const loadFromVault = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@laria_${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Chyba pri čítaní z trezoru:", e);
    return null;
  }
};

// --- 4. ROZHODOVACÍ PROTOKOL ---
export const runLariaProtocol = (identity) => {
  // MASTER_SHA si potom odčítaš z konzoly po prvom spustení s novým kódom
  const MASTER_SHA = process.env.EXPO_PUBLIC_OWNER_SHA;
  const isAdmin = identity.sha && identity.sha === MASTER_SHA;

  return {
    isOnline: !!identity.sha,
    isIrcOnline: !!identity.irc,
    hasNFC: !!identity.nfc,
    isParanoid: !identity.email && !!identity.sha,
    isGoogleFull: !!identity.email && !!identity.gTab,
    isChainNode: !!identity.gTab && !!identity.email,
    isAdmin: !!isAdmin
  };
};

// Exportujeme aj generátor, aby sme ho mohli použiť v Context-e
export { generatePureSHA };