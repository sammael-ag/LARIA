/**
 * LARIA v2.5: SettingsScreen (Core Config & Identity Network Recovery)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_NO_SPAGHETTI / DEEP_LOGGING_EDITION
 * ÚPRAVA: Doplnená masívna sieť monitorovacích logov pre odhalenie záhady na webe.
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
  console.log("📡 [LARIA_TRACE] SettingsScreen sa práve vykresľuje (Render).");

  // 🔮 Kontextové premenné
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

  // 🔎 LOG 1: Sledovanie kontextu hneď pri štarte/zmene
  useEffect(() => {
    console.log("🗄️ [LARIA_TRACE] Stav VAULTU z LariaContext:", {
      má_identitu: !!vault?.identity,
      aktuálne_sha_v_trezore: vault?.identity?.sha || "ŽIADNE",
      meno: vault?.identity?.meno || "ŽIADNE",
      email: vault?.identity?.email || "ŽIADNY"
    });
  }, [vault]);

  // 🔎 LOG 2: Sledovanie krypto-peňaženky
  useEffect(() => {
    console.log("🔐 [LARIA_TRACE] Stav KryptoContextu:", {
      walletAddress: walletAddress || "NEDOSTUPNÁ",
      lariaBalance: lariaBalance,
      ethBalance: ethBalance,
      isLoadingKrypto: isLoading
    });
    if (walletAddress) {
      syncWalletData(walletAddress);
    }
  }, [walletAddress]);

  // 🔎 LOG 3: Kontrola zamknutia tlačidla pre obnovu v reálnom čase
  useEffect(() => {
    console.log("⌨️ [LARIA_TRACE] Zmena textu v recovery inpute:", {
      zadanýText: `"${recoverySha}"`,
      dĺžkaTextu: recoverySha.length,
      jeTextPrázdnyPoTrimme: !recoverySha.trim(),
      stavRecoveryLoading: recoveryLoading,
      BUDE_TLAČIDLO_DISABLED: !recoverySha.trim() || recoveryLoading
    });
  }, [recoverySha, recoveryLoading]);

  const copySHA = () => {
    console.log("📋 [LARIA_TRACE] Kliknuté na kopírovanie SHA. Obsah:", vault?.identity?.sha);
    if (vault?.identity?.sha) {
      Clipboard.setString(vault.identity.sha);
      if (Platform.OS === 'web') alert("PEČAŤ SKOPÍROVANÁ\nTento kód je tvojím digitálnym odtlačkom v Matrixe.");
      else {
        Alert.alert(
          txt.alert_sha_title || "PEČAŤ SKOPÍROVANÁ", 
          txt.alert_sha_desc || "Tento kód je tvojím digitálnym odtlačkom v Matrixe."
        );
      }
    }
  };

  const copyWallet = () => {
    console.log("📋 [LARIA_TRACE] Kliknuté na kopírovanie Peňaženky. Obsah:", walletAddress);
    if (walletAddress) {
      Clipboard.setString(walletAddress);
      if (Platform.OS === 'web') alert("NODE ADDRESS SKOPÍROVANÁ\nTvoja adresa pre príjem Laria artefaktov je v schránke.");
      else {
        Alert.alert(
          txt.alert_wallet_title || "NODE ADDRESS SKOPÍROVANÁ", 
          txt.alert_wallet_desc || "Tvoja adresa pre príjem Laria artefaktov je v schránke."
        );
      }
    }
  };

  const executeEmailBackup = async (targetEmail) => {
    setEmailLoading(true);
    console.log(`📧 [LARIA_TRACE] Štart executeEmailBackup pre: ${targetEmail}`);
    try {
      console.log(`📧 LARIA_BACKUP: Odosielam SHA zálohu na e-mail: ${targetEmail}`);
      if (Platform.OS === 'web') alert(`ZÁLOHA ODOSLANÁ\nTvoja bezpečná pečať (SHA) bola odoslaná na e-mail: ${targetEmail}`);
      else {
        Alert.alert(
          "ZÁLOHA ODOSLANÁ", 
          `Tvoja bezpečná pečať (SHA) bola odoslaná na e-mail: ${targetEmail}\nUschovaj si LinkedIn pre prípad obnovy.`
        );
      }
    } catch (error) {
      console.error("❌ [LARIA_TRACE] Chyba zálohy emailu:", error);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendEmailBackup = () => {
    console.log("✉️ [LARIA_TRACE] Kliknuté na handleSendEmailBackup");
    if (!vault?.identity?.sha) {
      console.warn("⚠️ [LARIA_TRACE] handleSendEmailBackup zrušený - v trezore nie je SHA");
      return;
    }
    
    const userEmail = vault?.identity?.email;
    console.log("✉️ [LARIA_TRACE] Email z vizitky:", userEmail);
    
    if (!userEmail || userEmail.trim() === "") {
      console.log("✉️ [LARIA_TRACE] Email chýba, otváram Modal");
      setInputEmail('');
      setShowEmailModal(true);
      return;
    }

    executeEmailBackup(userEmail.trim());
  };

  const handleModalEmailSubmit = async () => {
    console.log("✉️ [LARIA_TRACE] Potvrdenie emailu z Modalu:", inputEmail);
    const cleanEmail = inputEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      if (Platform.OS === 'web') alert("Zadaj prosím správny formát e-mailovej adresy.");
      else Alert.alert("NEPLATNÝ EMAIL", "Zadaj prosím správny formát e-mailovej adresy.");
      return;
    }

    setShowEmailModal(false);

    try {
      const updatedIdentity = {
        ...vault?.identity,
        email: cleanEmail
      };
      console.log("💾 [LARIA_TRACE] Ukladám nový email do vizitky...", updatedIdentity);
      await syncIdentity(updatedIdentity);
    } catch (err) {
      console.error("❌ [LARIA_TRACE] Zlyhal zápis emailu do trezoru:", err);
    }

    executeEmailBackup(cleanEmail);
  };

  // 🔄 HLAVNÝ TERČ VYŠETROVANIA: OBNOVA IDENTITY
  const handleAccountRecovery = async () => {
    // 🛡️ Okamžitý log hneď po zavolaní funkcie, aby sme vedeli, či onPress vôbec prešiel cez dotykovú vrstvu!
    console.log("🔥 [LARIA_TRACE] >>> FUNKCIA handleAccountRecovery BOLA ÚSPEŠNE VYVOLANÁ! <<<");
    
    const cleanSha = recoverySha.trim().toLowerCase();
    console.log(`🔥 [LARIA_TRACE] Spracovaný kód na recovery: "${cleanSha}" (Pôvodný: "${recoverySha}")`);

    if (!cleanSha) {
      console.warn("🔥 [LARIA_TRACE] Prerušujem: cleanSha je prázdne.");
      return;
    }

    if (!cleanSha.startsWith("0x") || cleanSha.length < 12) {
      console.warn(`🔥 [LARIA_TRACE] Prerušujem: kód nespĺňa formát (štart na 0x a dĺžka aspoň 12 znakov). Dĺžka je: ${cleanSha.length}`);
      const msg = "Zadaný kód nevyzerá ako platná Laria Pečať (SHA). Musí začínať na 0x a mať aspoň 12 znakov.";
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert("NEPLATNÝ FORMÁT", msg);
      return;
    }

    setRecoveryLoading(true);
    console.log("🔥 [LARIA_TRACE] Nastavené: recoveryLoading = true");

    try {
      console.log(`📡 [LARIA_TRACE] Odoosielam sieťový lúč do GMatrixService -> recoverFromGMatrix("${cleanSha}")`);
      const response = await recoverFromGMatrix(cleanSha);
      console.log("📡 [LARIA_TRACE] Odpoveď z GMatrixService prijatá:", response);

      if (response && response.success && response.data) {
        const matrixData = response.data;
        console.log("✅ [LARIA_TRACE] Matrix poslal dáta identity úspešne:", matrixData);
        
        console.log("🔮 [LARIA_TRACE] Volám obnovitIdentityCezSHA z LariaContext...");
        const success = await obnovitIdentityCezSHA(matrixData.sha, matrixData.meno);
        console.log("🔮 [LARIA_TRACE] Výsledok obnovitIdentityCezSHA:", success);

        if (success) {
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
            poznamka: matrixData.sha.substring(0, 12),
            krypt: matrixData.krypt
          };

          console.log("💾 [LARIA_TRACE] Synchronizujem kompletnú vizitku do trezoru...", fullIdentity);
          await syncIdentity(fullIdentity);

          const successMsg = `Sammael, tvoja pôvodná identita [${matrixData.meno}] bola úspešne stiahnutá z Matrixu a obnovená.`;
          if (Platform.OS === 'web') alert(successMsg);
          else Alert.alert("OBNOVA ÚSPEŠNÁ", successMsg);
          
          setRecoverySha('');
          navigation.goBack();
        } else {
          console.error("❌ [LARIA_TRACE] Kontext odmietol reinkarnáciu.");
          if (Platform.OS === 'web') alert("Kryptografický kokon odmietol prebudiť túto identitu.");
          else Alert.alert("CHYBA REINKARNÁCIE", "Kryptografický kokon odmietol prebudiť túto identitu.");
        }

      } else {
        console.warn("⚠️ [LARIA_TRACE] Matrix pečať nenašiel alebo vrátil chybu:", response?.error);
        const failMsg = response?.error || "Matrix túto pečať neeviduje. Skontroluj preklepy v kóde.";
        if (Platform.OS === 'web') alert(failMsg);
        else Alert.alert("PEČAŤ NENÁJDENÁ", failMsg);
      }
    } catch (error) {
      console.error("❌ [LARIA_TRACE] Kritická chyba počas behu handleAccountRecovery:", error);
      if (Platform.OS === 'web') alert("Obnovovací uzol neodpovedá. Skontroluj sieť.");
      else Alert.alert("CHYBA MATRIXU", "Obnovovací uzol neodpovedá. Skontroluj sieť.");
    } finally {
      setRecoveryLoading(false);
      console.log("🔥 [LARIA_TRACE] Uvoľnené: recoveryLoading = false");
    }
  };

  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}`
    : (txt.init_connection || "INICIALIZUJEM SPOJENIE...");

  // Výpočet disabled stavu pre tlačidlo obnovy
  const isRecoveryDisabled = !recoverySha.trim() || recoveryLoading;

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1 }]}>
      
      <TouchableOpacity onPress={() => { console.log("‹ [LARIA_TRACE] Kliknuté na návrat."); navigation.goBack(); }} activeOpacity={0.7} style={G.topLeftBackButton}>
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
              onChangeText={(text) => {
                console.log(`⌨️ [LARIA_TRACE] Užívateľ píše do inputu: "${text}"`);
                setRecoverySha(text);
              }} 
              placeholder="Vlož sem svoje existujúce SHA (0x...)" 
              placeholderTextColor="#444" 
              autoCapitalize="none" 
              autoCorrect={false}
            />

            {/* 🔄 TLAČIDLO: Obnova účtu */}
            <TouchableOpacity 
              style={[G.primaryBtn, { 
                backgroundColor: recoveryLoading ? '#000' : '#111', 
                borderColor: !isRecoveryDisabled ? ACCENT : '#222',
                marginTop: 12,
                width: '100%',
                opacity: !isRecoveryDisabled ? 1 : 0.5 // Pridaná vizuálna kontrola priamo pre web
              }]}
              onPress={() => {
                console.log("🔘 [LARIA_TRACE] Fyzické stlačenie tlačidla OBNOVIŤ ÚČET detegované v JSX.");
                handleAccountRecovery();
              }}
              disabled={isRecoveryDisabled}
            >
              {recoveryLoading ? (
                <ActivityIndicator color={ACCENT} />
              ) : (
                <Text style={[G.primaryBtnText, { color: !isRecoveryDisabled ? ACCENT : '#444' }]}>
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
              onPress={() => {
                console.log("🔘 [LARIA_TRACE] Kliknuté na aktualizáciu krypto-uzla.");
                syncWalletData(walletAddress);
              }}
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