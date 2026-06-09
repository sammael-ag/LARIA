import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';

/**
 * PROTOKOL LARIA ART v8.1 - THE CRYPTO SUVEREIGN SEAL
 * STATUS: SYNCED / CLEAN WEB THE LAW
 * Popis: Generátor identity, trezor a krypto-strážca bez indiskrétneho Device ID.
 */

// --- 1. VNÚTORNÝ MLYNČEK (Generátor posvätného SHA) ---
// Sammael, v novom rytme hashujeme kombináciu unikátneho krypto-kľúča a zadaného mena.
export const generatePureSHA = (cryptoSalt, name) => {
  // 🛡️ ZÁKON IDENTITY: Ak chýba krypto-základ ALEBO meno, identita nevznikne
  if (!cryptoSalt || !name || name.trim() === "") {
    console.log("⚠️ LARIA_LOGIC: Pokus o hashovanie bez mena alebo krypto-základu zamietnutý.");
    return null;
  }
  
  // Zaistíme, že zo soli (či už je to privátny kľúč alebo token) vytiahneme čistý text
  let cleanSalt = String(cryptoSalt).trim();

  // Normalizujeme vstupy pre stabilné vedomie Matrixu
  const rawInput = `${cleanSalt}-${name.toLowerCase().trim()}`;
  
  // Pôvodná nedotknutá matematika dvojitého hashovania
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

// --- 2. KRYPTOGRAFICKÝ PODPIS VIZITKY (Proof of Human Action) ---
// Táto funkcia digitálne podpíše FING pomocou privátneho kľúča peňaženky aplikácie.
// Google Sheets tak overí, že požiadavku posiela skutočný majiteľ peňaženky a nie bot.
export const signLariaFing = async (privateKey, fing) => {
  try {
    if (!privateKey || !fing) return null;
    const wallet = new ethers.Wallet(privateKey);
    // Vytvoríme nezameniteľný digitálny podpis pre nálhľad tabuľky
    const signature = await wallet.signMessage(fing);
    return signature;
  } catch (error) {
    console.error("❌ LARIA_LOGIC_SIGN_ERROR:", error.message);
    return null;
  }
};

// --- 3. TAJNÉ KONŠTANTY (Tiene tvojho sveta) ---
const MASTER_SHA_SHADOW = "0x54f91c11a4a2a660f"; 
const ARCHITECT_HASH_SHADOW = "0x75d93eeee454e9ed2";

// --- 4. POMOCNÉ FUNKCIE TREZORU (AsyncStorage) ---
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

// --- 5. OVERENIE PEČATE (Slovo Moci) ---
export const verifyArchitectSeal = (secretWord) => {
  if (!secretWord) return false;
  // Zomelieme slovo so soľou "ARCHITECT"
  const inputHash = generatePureSHA(secretWord, "ARCHITECT");
  return inputHash === ARCHITECT_HASH_SHADOW;
};

/**
 * 6. OCHRANA IDENTITY (Anti-Drain Poistka)
 */
export const getSacredWallet = async () => {
  const saved = await loadFromVault('identity');
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
 * 7. ROZHODOVACÍ PROTOKOL v8.1
 */
export const runLariaProtocol = (identity, hasSeal = false) => {
  if (!identity || !identity.sha) return { isAdmin: false };

  const isAdmin = (hasSeal === true);

  return {
    isOnline: !!identity.sha,
    isIrcOnline: !!identity.irc,
    hasNFC: !!identity.nfc,
    isParanoid: !identity.email && !!identity.sha,
    isGoogleFull: !!identity.email && !!identity.isPublic,
    isChainNode: !!identity.krypt && !!identity.isPublic,
    isAdmin: isAdmin 
  };
};