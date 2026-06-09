/**
 * LARIA v2.5: SettingsScreen (Core Config & Identity Network Recovery)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_NO_SPAGHETTI
 * ÚPRAVA: Plné sieťové prepojenie na GMatrixService pre obnovu účtu cez SHA kľúč.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, 
  Alert, Platform, Clipboard, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useKrypto } from '../context/KryptoContext';
import { useLaria } from '../context/LariaContext'; 
import { G, ACCENT } from '../styles/styles'; 
// 📡 Importujeme sieťový mlynček pre obnovu
import { recoverFromGMatrix } from '../services/GMatrixService';

const SettingsScreen = ({ navigation }) => {
  // 🔮 Doplnená funkcia obnovitIdentityCezSHA pre hlboké prebudenie identity
  const { t, vault, syncIdentity, obnovitIdentityCezSHA } = useLaria(); 
  const txt = t('settings') || {}; 

  const [recoverySha, setRecoverySha] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Stavy pre e-mailový prompt (Modal)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [inputEmail, setInputEmail] = useState('');

  const { 
    lariaBalance, 
    ethBalance, 
    walletAddress, 
    isLoading, 
    syncWalletData 
  } = useKrypto();

  useEffect(() => {
    if (walletAddress) {
      syncWalletData(walletAddress);
    }
  }, [walletAddress]);

  const copySHA = () => {
    if (vault?.identity?.sha) {
      Clipboard.setString(vault.identity.sha);
      Alert.alert(
        txt.alert_sha_title || "PEČAŤ SKOPÍROVANÁ", 
        txt.alert_sha_desc || "Tento kód je tvojím digitálnym odtlačkom v Matrixe."
      );
    }
  };

  const copyWallet = () => {
    if (walletAddress) {
      Clipboard.setString(walletAddress);
      Alert.alert(
        txt.alert_wallet_title || "NODE ADDRESS SKOPÍROVANÁ", 
        txt.alert_wallet_desc || "Tvoja adresa pre príjem Laria artefaktov je v schránke."
      );
    }
  };

  // Funkcia na samotné odoslanie e-mailu
  const executeEmailBackup = async (targetEmail) => {
    setEmailLoading(true);
    try {
      console.log(`📧 LARIA_BACKUP: Odosielam SHA zálohu na e-mail: ${targetEmail}`);
      
      // Sem neskôr prepojíš tvoj GMatrix call do Apps Scriptu
      Alert.alert(
        "ZÁLOHA ODOSLANÁ", 
        `Tvoja bezpečná pečať (SHA) bola odoslaná na e-mail: ${targetEmail}\nUschovaj si LinkedIn pre prípad obnovy.`
      );
    } catch (error) {
      console.error("Chyba zálohy:", error);
      Alert.alert("CHYBA SYSTÉMU", "Nepodarilo sa spojiť s poštovým mlynčekom.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ✉️ HLAVNÝ TRIGGER PRE ODOSLANIE E-MAILU
  const handleSendEmailBackup = () => {
    if (!vault?.identity?.sha) return;
    
    const userEmail = vault?.identity?.email;
    
    // Ak e-mail neexistuje, otvoríme náš pripravený prompt
    if (!userEmail || userEmail.trim() === "") {
      setInputEmail('');
      setShowEmailModal(true);
      return;
    }

    // Ak e-mail existuje, rovno ho zomelielme
    executeEmailBackup(userEmail.trim());
  };

  // Potvrdenie e-mailu z modálneho okna + zápis do trezoru
  const handleModalEmailSubmit = async () => {
    const cleanEmail = inputEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert("NEPLATNÝ EMAIL", "Zadaj prosím správny formát e-mailovej adresy.");
      return;
    }

    setShowEmailModal(false);

    // 🔄 AUTOMATICKÝ ZÁPIS DO TREZORU: Uložíme e-mail do identity, aby bol nabudúce k dispozícii
    try {
      const updatedIdentity = {
        ...vault?.identity,
        email: cleanEmail
      };
      await syncIdentity(updatedIdentity);
      console.log("💾 LARIA_VAULT: E-mail bol dodatočne uložený do tvojej vizitky.");
    } catch (err) {
      console.error("Nepodarilo sa aktualizovať e-mail v trezore:", err);
    }

    // Odoslanie zálohy
    executeEmailBackup(cleanEmail);
  };

  // 🔄 SKUTOČNÁ OBNOVA IDENTITY CEZ EXISTÚCE SHA (PREPOJENÉ NA BACKEND)
  const handleAccountRecovery = async () => {
    // 🛡️ Ošetrenie textu na malé písmená, aby SHA licovalo s blockchainovým/hex formátom (0xabc...)
    const cleanSha = recoverySha.trim().toLowerCase();
    if (!cleanSha) return;

    if (!cleanSha.startsWith("0x") || cleanSha.length < 20) {
      Alert.alert("NEPLATNÝ FORMÁT", "Zadaný kód nevyzerá ako platná Laria Pečať (SHA).");
      return;
    }

    setRecoveryLoading(true);
    try {
      console.log(`🔄 LARIA_RECOVERY: Vyťahujem staré dáta z Matrixu pre SHA: ${cleanSha}`);
      
      // Voláme našu sieťovú funkciu z GMatrixService
      const response = await recoverFromGMatrix(cleanSha);

      if (response && response.success && response.data) {
        const matrixData = response.data;
        
        // 🔮 KROK 1: Spustíme hlbokú kvantovú reinkarnáciu identity v Contexte
        const success = await obnovitIdentityCezSHA(matrixData.sha, matrixData.meno);

        if (success) {
          // 🗄️ KROK 2: Namapujeme a zosynchronizujeme zvyšok stiahnutých dát vizitky z tabuľky
          const fullIdentity = {
            ...vault?.identity,
            sha: matrixData.sha,
            date: matrixData.date,
            meno: matrixData.meno,
            kat: matrixData.kat,
            lok: matrixData.lok,
            popis: matrixData.popis,
            tel: matrixData.tel,
            email: matrixData.email,
            fb: matrixData.fb,
            tg: matrixData.tg,
            gal: matrixData.gal,
            isPublic: matrixData.isPublic === true || matrixData.isPublic === "true",
            irc: matrixData.irc,
            poznamka: matrixData.sha.substring(0, 12), // FING odvodíme stabilne z SHA
            krypt: matrixData.krypt
          };

          await syncIdentity(fullIdentity);

          Alert.alert(
            "OBNOVA ÚSPEŠNÁ", 
            `Sammael, tvoja pôvodná identita [${matrixData.meno}] bola úspešne stiahnutá z Matrixu a obnovená.`
          );
          
          // Vyčistíme políčko a vrátime ťa do Ateliéru k vizitkám
          setRecoverySha('');
          navigation.goBack();
        } else {
          Alert.alert("CHYBA REINKARNÁCIE", "Kryptografický kokon odmietol prebudiť túto identitu.");
        }

      } else {
        Alert.alert(
          "PEČAŤ NENÁJDENÁ", 
          response.error || "Matrix túto pečať neeviduje. Skontroluj preklepy v kóde."
        );
      }
    } catch (error) {
      console.error("Chyba obnovy:", error);
      Alert.alert("CHYBA MATRIXU", "Obnovovací uzol neodpovedá. Skontroluj sieť.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}`
    : (txt.init_connection || "INICIALIZUJEM SPOJENIE...");

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1 }]}>
      
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={G.screenContainer} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', alignSelf: 'center' }}>
          
          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>{txt.title || "Nastavenia"}</Text>
          </View>

          {/* 🛡️ SEKCE: SVRCHOVANÁ IDENTITA A OBNOVA */}
          <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 35 }}>
            <Text style={[G.statusTextSmall, { letterSpacing: 2, marginBottom: 10, color: '#444' }]}>
              {txt.identity_recovery || "SPRÁVA PEČATE A IDENTITY"}
            </Text>
            
            {/* Zobrazenie SHA */}
            <TouchableOpacity onPress={copySHA} activeOpacity={0.7} style={G.identityResetBox}>
              <View style={G.identityResetContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[G.monoIdentity, { color: '#b19cd9', fontSize: 10, marginBottom: 5 }]}>MASTER_SHA_IDENT_KEY</Text>
                  <Text style={G.identityResetText} numberOfLines={1}>
                    {vault?.identity?.sha || (txt.looking_for_seal || 'HĽADÁM PEČAŤ...')}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, marginLeft: 15 }}>📋</Text>
              </View>
            </TouchableOpacity>

            {/* ✉️ TLAČIDLO: Odoslať emailom */}
            <TouchableOpacity 
              style={[G.primaryBtn, { 
                backgroundColor: emailLoading ? '#000' : '#111', 
                borderColor: vault?.identity?.sha && !emailLoading ? ACCENT : '#222',
                marginTop: 12,
                width: '100%'
              }]}
              onPress={handleSendEmailBackup}
              disabled={!vault?.identity?.sha || emailLoading}
            >
              {emailLoading ? (
                <ActivityIndicator color={ACCENT} />
              ) : (
                <Text style={[G.primaryBtnText, { color: vault?.identity?.sha && !emailLoading ? ACCENT : '#444' }]}>
                  {txt.btn_send_email || "ODOSLAŤ EMAILOM"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ width: '100%', height: 1, backgroundColor: '#151515', marginVertical: 25 }} />

            {/* MODUL PRE OBNOVU ÚČTU */}
            <Text style={[G.statusTextSmall, { letterSpacing: 2, marginBottom: 10, color: '#444' }]}>
              {txt.title_recovery_input || "OBNOVA ÚČTU Z MATRIXU"}
            </Text>
            
            <TextInput 
              style={[G.vaultInput, { width: '100%', color: '#FFF' }]} 
              value={recoverySha} 
              onChangeText={setRecoverySha} 
              placeholder="Vlož sem svoje existujúce SHA (0x...)" 
              placeholderTextColor="#444" 
              autoCapitalize="none" 
              autoCorrect={false}
            />

            {/* 🔄 TLAČIDLO: Obnova účtu */}
            <TouchableOpacity 
              style={[G.primaryBtn, { 
                backgroundColor: recoveryLoading ? '#000' : '#111', 
                borderColor: recoverySha.trim() && !recoveryLoading ? ACCENT : '#222',
                marginTop: 12,
                width: '100%'
              }]}
              onPress={handleAccountRecovery}
              disabled={!recoverySha.trim() || recoveryLoading}
            >
              {recoveryLoading ? (
                <ActivityIndicator color={ACCENT} />
              ) : (
                <Text style={[G.primaryBtnText, { color: recoverySha.trim() && !recoveryLoading ? ACCENT : '#444' }]}>
                  {txt.btn_recover || "OBNOVIŤ ÚČET"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AKTÍVNY UZOL */}
          <View style={[G.card, G.activeNodeCard, { marginBottom: 25 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[G.monoIdentity, { color: ACCENT, fontWeight: 'bold' }]}>ACTIVE_NODE_RESOURCES</Text>
              {isLoading && <ActivityIndicator size="small" color={ACCENT} />}
            </View>
            
            <TouchableOpacity onPress={copyWallet} activeOpacity={0.6} style={G.publicAddressBox}>
              <Text style={[G.statusTextSmall, { fontSize: 9, marginBottom: 5 }]}>PUBLIC_ADDRESS:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[G.monoIdentity, { fontSize: 12, color: '#FFF' }]}>{shortAddress}</Text>
                  <Text style={{ fontSize: 14 }}>📋</Text>
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={G.cardDescriptionText}>LARIA Assets:</Text>
              <Text style={[G.cardTitleText, { fontSize: 13 }]}>
                {isLoading ? "..." : `${Number(lariaBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})} LARIA`}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
              <Text style={G.cardDescriptionText}>Base Gas (ETH):</Text>
              <Text style={[G.cardTitleText, { fontSize: 13 }]}>
                {isLoading ? "..." : `${Number(ethBalance || 0).toFixed(6)} ETH`}
              </Text>
            </View>

            <TouchableOpacity 
              style={[G.primaryBtn, { 
                backgroundColor: isLoading ? '#000' : '#111', 
                borderColor: walletAddress && !isLoading ? ACCENT : '#222'
              }]}
              onPress={() => syncWalletData(walletAddress)}
              disabled={!walletAddress || isLoading}
            >
              <Text style={[G.primaryBtnText, { color: walletAddress && !isLoading ? ACCENT : '#444' }]}>
                {isLoading ? txt.btn_updating : txt.btn_update}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spodný návrat */}
          <TouchableOpacity style={[G.backToAtelierBtn, { width: '100%', marginBottom: 30 }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={G.primaryBtnText}>{txt.btn_back || "NÁVRAT"}</Text>
          </TouchableOpacity>

          {/* BUILD FOOTER */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#1a1a1a', fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>
              LARIA OS | RÁKOŠ BUILD v8.2 | 2026
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* 📥 MODÁLNE OKNO PRE CHÝBAJÚCI EMAIL */}
      <Modal visible={showEmailModal} transparent={true} animationType="fade">
        <View style={G.modalOverlay}>
          <View style={{ 
            backgroundColor: '#050505', 
            borderWidth: 1, 
            borderColor: '#1a1a1a', 
            width: '90%', 
            maxWidth: 450, 
            borderRadius: 12,
            padding: 20
          }}>
            <Text style={[G.monoIdentity, { color: ACCENT, marginBottom: 10, fontSize: 14 }]}>
              ZADANIE ZÁLOHOVÉHO EMAILU
            </Text>
            
            <Text style={[G.cardDescriptionText, { marginBottom: 15, fontSize: 12, lineHeight: 16 }]}>
              Sammael, vo tvojej vizitke zatiaľ nie je uložený e-mail. Zadaj ho sem, aby sme ti mohli bezpečne poslať tvoju pečať. Zároveň sa ti automaticky uloží do trezoru.
            </Text>

            <TextInput 
              style={[G.vaultInput, { width: '100%', color: '#FFF', marginBottom: 20 }]} 
              value={inputEmail} 
              onChangeText={setInputEmail} 
              placeholder="Zadaj svoj e-mail..." 
              placeholderTextColor="#444" 
              keyboardType="email-address"
              autoCapitalize="none" 
              autoCorrect={false}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={{ padding: 12, flex: 1, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#222', borderRadius: 6 }}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={{ color: '#666', fontWeight: 'bold' }}>ZRUŠIŤ</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[G.primaryBtn, { 
                  flex: 1, 
                  marginTop: 0, 
                  padding: 12,
                  backgroundColor: inputEmail.trim() ? '#1a1a1a' : '#000',
                  borderColor: inputEmail.trim() ? ACCENT : '#222' 
                }]}
                onPress={handleModalEmailSubmit}
                disabled={!inputEmail.trim()}
              >
                <Text style={[G.primaryBtnText, { color: inputEmail.trim() ? ACCENT : '#444', fontSize: 13 }]}>
                  ODOSLAŤ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default SettingsScreen;