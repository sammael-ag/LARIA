import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PROTOKOL LARIA ART v2.4 - THE ARCHITECT'S FINAL SEAL
 * Úplná nezávislosť, čistá digitálna tesárčina.
 */

// --- 1. VNÚTORNÝ MLYNČEK (Generátor Hashov) ---
export const generatePureSHA = (deviceId, name = "Sammael") => {
  if (!deviceId) return null;
  const rawInput = `${deviceId}-${name.toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < rawInput.length; i++) {
    const char = rawInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const finalSha = "0x" + hex + Math.abs(hash * 31).toString(16).substring(0, 24);
  return finalSha;
};

// --- 2. TAJNÉ KONŠTANTY (Zatlčené Shadows) ---
const MASTER_SHA_SHADOW = "0x54f91c11a4a2a660f"; 
const ARCHITECT_HASH_SHADOW = "0x75d93eeee454e9ed2";

// --- 3. POMOCNÉ FUNKCIE TREZORU ---
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

// --- 4. OVERENIE PEČATE ---
export const verifyArchitectSeal = (secretWord) => {
  if (!secretWord) return false;
  
  // Zomelieme zadané slovo pomocou mlynčeka so soľou "ARCHITECT"
  const inputHash = generatePureSHA(secretWord, "ARCHITECT");
  
  // Prísne porovnanie tieňov
  return inputHash === ARCHITECT_HASH_SHADOW;
};

// --- 5. ROZHODOVACÍ PROTOKOL ---
export const runLariaProtocol = (identity, hasSeal = false) => {
  if (!identity || !identity.sha) return { isAdmin: false };

  // Dvojfázové overenie: Správne zariadenie + Odomknutá pečať v AsyncStorage
  const isMasterDevice = identity.sha === MASTER_SHA_SHADOW;
  const isAdmin = isMasterDevice && (hasSeal === true);

  return {
    isOnline: !!identity.sha,
    isIrcOnline: !!identity.irc,
    hasNFC: !!identity.nfc,
    isParanoid: !identity.email && !!identity.sha,
    isGoogleFull: !!identity.email && !!identity.gTab,
    isChainNode: !!identity.gTab && !!identity.email,
    isAdmin: isAdmin // Odovzdávame čistú pravdu (Boolean)
  };
};