import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PROTOKOL LARIA ART v1.0
 * Tento mozog rozhoduje o statusoch a ukladá dáta do trezoru v mobile.
 */

// 1. ULOŽENIE DO TREZORU (Zápis do pamäte mobilu)
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

// 2. NAČÍTANIE Z TREZORU (Pri štarte appky)
export const loadFromVault = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@laria_${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Chyba pri čítaní z trezoru:", e);
    return null;
  }
};

// 3. ROZHODOVACÍ PROTOKOL (Tento mení tvoje statusy)
export const runLariaProtocol = (identity) => {
  // Overenie Admina - porovnáme tvoje SHA s tajným kľúčom v .env
  const MASTER_KEY = process.env.EXPO_PUBLIC_OWNER_SHA;
  const isAdmin = identity.sha && identity.sha === MASTER_KEY;

  const status = {
    isOnline: !!identity.sha, // Ak má SHA, je ONLINE
    isIrcOnline: !!identity.irc,
    hasNFC: !!identity.nfc,
    isParanoid: !identity.email && !!identity.sha, // Ak má SHA ale nemá email
    isGoogleFull: !!identity.email && !!identity.gTab, // Ak má email aj tabuľku
    isChainNode: !!identity.gTab && !!identity.email, // Podmienka pre uzol
    isAdmin: !!isAdmin // Dynamicky vypočítané oprávnenie
  };

  return status;
};