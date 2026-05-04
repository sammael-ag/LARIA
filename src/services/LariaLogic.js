import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PROTOKOL LARIA ART v2.5 - THE ARCHITECT'S FINAL SEAL
 * Ochrana proti Faucet Drain & Identity Drift.
 */

// --- 1. VNÚTORNÝ MLYNČEK (Generátor Hashov) ---
export const generatePureSHA = (deviceId, name = "Sammael") => {
  if (!deviceId) return null;
  // name.toLowerCase() zabezpečuje, že Sammael aj sammael hodia rovnaký hash
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
// Tieto ostávajú pre spätnú kompatibilitu, ale už neblokujú prístup ak máš Pečať
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
  
  // Porovnanie so zatieneným heslom
  return inputHash === ARCHITECT_HASH_SHADOW;
};

/**
 * 5. OCHRANA IDENTITY (Anti-Drain Poistka)
 * Táto funkcia skontroluje, či už v trezore existuje adresa.
 * Ak áno, nedovolí Manfredovi vytvoriť novú peňaženku.
 */
export const getSacredWallet = async (currentIdentity) => {
  const saved = await loadFromVault('identity');
  if (saved && saved.walletAddress) {
    return {
      address: saved.walletAddress,
      key: saved.privateKey,
      isRecovered: true
    };
  }
  return null;
};

// --- 6. ROZHODOVACÍ PROTOKOL (Vylepšený pre Architecta) ---
export const runLariaProtocol = (identity, hasSeal = false) => {
  if (!identity || !identity.sha) return { isAdmin: false };

  /**
   * ZMENA LOGIKY:
   * Admin status (isAdmin) je teraz viazaný PRÍMÁRNE na Pečať (hasSeal).
   * Ak si zadal správne Slovo moci v Dashboarde, hasSeal je true.
   * Je jedno, či si v mobile Manfred alebo Sammael.
   */
  const isAdmin = (hasSeal === true);

  return {
    isOnline: !!identity.sha,
    isIrcOnline: !!identity.irc,
    hasNFC: !!identity.nfc,
    isParanoid: !identity.email && !!identity.sha,
    isGoogleFull: !!identity.email && !!identity.gTab,
    isChainNode: !!identity.gTab && !!identity.email,
    isAdmin: isAdmin // Čistá pravda o tvojej moci
  };
};