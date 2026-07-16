/**
 * LARIA v2.5.1: SettingsScreen (Core Config & Identity Network Recovery)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_NO_SPAGHETTI / DEEP_LOGGING_EDITION
 * ÚPRAVA v2.5.1:
 * - Zosúladené načítavanie adresy peňaženky s Dashboardom pomocou wagmi (useAccount).
 * - Opravený preklep v onChangeText pre zadávanie e-mailu v modáli.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, 
  Alert, Platform, Clipboard, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi'; // 🔥 ZLADENIE S DASHBOARDOM

import { useKrypto } from '../context/KryptoContext';
import { useLaria } from '../context/LariaContext'; 
import { G, ACCENT } from '../styles/styles'; 
// 📡 Importujeme sieťový mlynček pre obnovu a pre reálne odosielanie emailu
import { recoverFromGMatrix, sendEmailViaGMatrix } from '../services/GMatrixService';

const SettingsScreen = ({ navigation }) => {
  // 🕵️‍♂️ [TEMPORARY_DEV_TRACE] -> Pôjde neskôr von
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
    isLoading, 
    syncWalletData 
  } = useKrypto();

  // 🛰️ INTEGRÁCIA ZÍSKAVANIA ADRESY Z DASHBOARDU
  let addressFromWagmi = null;
  try {
    const accountData = useAccount();
    addressFromWagmi = accountData?.address;
  } catch (e) {
    console.log("Wagmi account fetch error in Settings:", e);
  }

  // Finálna reaktívna adresa peňaženky (presne ako na Dashboarde!)
  const userAddress = addressFromWagmi || vault?.identity?.krypt || (txt.no_address || "NO_ADDRESS_AVAILABLE");

  // 🕵️‍♂️ [TEMPORARY_DEV_TRACE] -> Sledovanie kontextu pri vývoji
  useEffect(() => {
    console.log("🗄️ [LARIA_TRACE] Stav VAULTU z LariaContext:", {
      má_identitu: !!vault?.identity,
      aktuálne_sha_v_trezore: vault?.identity?.sha || "ŽIADNE",
      meno: vault?.identity?.meno || "ŽIADNE",
      email: vault?.identity?.email || "ŽIADNY"
    });
  }, [vault]);

  // 🕵️‍♂️ [TEMPORARY_DEV_TRACE] -> Sledovanie krypto-peňaženky pri vývoji
  useEffect(() => {
    console.log("🔐 [LARIA_TRACE] Stav KryptoContextu (Zosúladený):", {
      userAddress: userAddress,
      lariaBalance: lariaBalance,
      ethBalance: ethBalance,
      isLoadingKrypto: isLoading
    });
    if (userAddress && userAddress !== "NO_ADDRESS_AVAILABLE") {
      syncWalletData(userAddress);
    }
  }, [userAddress]);

  // 🕵️‍♂️ [TEMPORARY_DEV_TRACE] -> Kontrola zamknutia tlačidla pre obnovu v reálnom čase
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
    console.log("📋 [LARIA_LOG] Kopírovanie SHA.");
    if (vault?.identity?.sha) {
      Clipboard.setString(vault.identity.sha);
      if (Platform.OS === 'web') {
        alert(`${txt.alert_sha_title || "PEČAŤ SKOPÍROVANÁ"}\n${txt.alert_sha_desc || "Tento kód je tvojím digitálnym odtlačkom v Matrixe."}`);
      } else {
        Alert.alert(
          txt.alert_sha_title || "PEČAŤ SKOPÍROVANÁ", 
          txt.alert_sha_desc || "Tento kód je tvojím digitálnym odtlačkom v Matrixe."
        );
      }
    }
  };

  const copyWallet = () => {
    console.log("📋 [LARIA_LOG] Kopírovanie Peňaženky.");
    if (userAddress && userAddress !== "NO_ADDRESS_AVAILABLE") {
      Clipboard.setString(userAddress);
      if (Platform.OS === 'web') {
        alert(`${txt.alert_wallet_title || "NODE ADDRESS SKOPÍROVANÁ"}\n${txt.alert_wallet_desc || "Tvoja adresa pre príjem Laria artefaktov je v schránke."}`);
      } else {
        Alert.alert(
          txt.alert_wallet_title || "NODE ADDRESS SKOPÍROVANÁ", 
          txt.alert_wallet_desc || "Tvoja adresa pre príjem Laria artefaktov je v schránke."
        );
      }
    }
  };

  const executeEmailBackup = async (targetEmail) => {
    setEmailLoading(true);
    console.log(`📧 [LARIA_LOG] Štart ostrej funkcie executeEmailBackup pre: ${targetEmail}`);
    
    try {
      const currentSha = vault?.identity?.sha || "0x00";
      const currentMeno = vault?.identity?.meno || "Cestovateľ";
      const emailSubject = "LARIA: Tvoja zálohovaná pečať identity";

      const templateVariables = {
        masterName: currentMeno,
        userSha: currentSha
      };

      const result = await sendEmailViaGMatrix(
        targetEmail, 
        "backup_sha_email", 
        emailSubject, 
        templateVariables
      );

      if (result && result.success) {
        const successTitle = txt.alert_backup_success || "ZÁLOHA ODOSLANÁ";
        const successDesc = (txt.alert_backup_desc || "Tvoja bezpečná pečať (SHA) bola odoslaná na e-mail: {email}\nUschovaj si ju pre prípad obnovy.")
          .replace("{email}", targetEmail);

        if (Platform.OS === 'web') {
          alert(`${successTitle}\n${successDesc}`);
        } else {
          Alert.alert(successTitle, successDesc);
        }
      } else {
        const errorTitle = "ODOSLANIE ZLYHALO";
        const errorDesc = result.error || "Brána mravca zlyhala pri generovaní šablóny.";
        if (Platform.OS === 'web') alert(`${errorTitle}\n${errorDesc}`);
        else Alert.alert(errorTitle, errorDesc);
      }

    } catch (error) {
      console.error("❌ [LARIA_ERROR] Kritická chyba zálohy emailu v sieťovej vrstve:", error);
      const failTitle = txt.alert_network_fail_title || "CHYBA MATRIXU";
      const failDesc = "Nepodarilo sa spojiť s poštovým uzlom. Skontroluj internetové spojenie.";
      if (Platform.OS === 'web') alert(`${failTitle}\n${failDesc}`);
      else Alert.alert(failTitle, failDesc);
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
      const badEmailTitle = txt.alert_invalid_email_title || "NEPLATNÝ EMAIL";
      const badEmailDesc = txt.alert_invalid_email_desc || "Zadaj prosím správny formát e-mailovej adresy.";
      
      if (Platform.OS === 'web') alert(`${badEmailTitle}\n${badEmailDesc}`);
      else Alert.alert(badEmailTitle, badEmailDesc);
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
      console.error("❌ [LARIA_ERROR] Zlyhal zápis emailu do trezoru:", err);
    }

    executeEmailBackup(cleanEmail);
  };

  const handleAccountRecovery = async () => {
    console.log("🔥 [LARIA_TRACE] >>> FUNKCIA handleAccountRecovery BOLA ÚSPEŠNE VYVOLANÁ! <<<");
    
    const cleanSha = recoverySha.trim().toLowerCase();
    console.log(`🔥 [LARIA_TRACE] Spracovaný kód na recovery: "${cleanSha}"`);

    if (!cleanSha) {
      console.warn("🔥 [LARIA_TRACE] Prerušujem: cleanSha je prázdne.");
      return;
    }

    if (!cleanSha.startsWith("0x") || cleanSha.length < 12) {
      console.warn(`🔥 [LARIA_TRACE] Prerušujem: kód nespĺňa formát. Dĺžka je: ${cleanSha.length}`);
      
      const msg = txt.alert_invalid_sha_desc || "Zadaný kód nevyzerá ako platná Laria Pečať (SHA). Musí začínať na 0x a mať aspoň 12 znakov.";
      const formatTitle = txt.alert_invalid_sha_title || "NEPLATNÝ FORMÁT";
      
      if (Platform.OS === 'web') alert(`${formatTitle}\n${msg}`);
      else Alert.alert(formatTitle, msg);
      return;
    }

    setRecoveryLoading(true);
    console.log("🔥 [LARIA_TRACE] Nastavené: recoveryLoading = true");

    try {
      console.log(`📡 [LARIA_LOG] Sieťový dopyt -> GMatrixService: recoverFromGMatrix`);
      const response = await recoverFromGMatrix(cleanSha);
      
      console.log("📡 [LARIA_TRACE] Odpoveď z GMatrixService prijatá:", response);

      if (response && response.success && response.data) {
  const matrixData = response.data;
  
  console.log("🔮 [LARIA_TRACE] Volám obnovitIdentityCezSHA z LariaContext...");
  const success = await obnovitIdentityCezSHA(matrixData.sha, matrixData.meno);

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
      Signal: matrixData.Signal, // 📡 PÔVODNÝ: Ponechaný bez zmeny pre plnú funkčnosť SignalContextu
      fing: matrixData.fing || (matrixData.sha ? `0x${matrixData.sha.toLowerCase().substring(0, 10)}` : "NO_FING"), // 🪐 ZMENENÉ: Čistý fing namiesto starej poznámky
      krypt: matrixData.krypt
    };
    
          await syncIdentity(fullIdentity);

          const successTitle = txt.alert_recovery_success_title || "OBNOVA ÚSPEŠNÁ";
          const successMsg = (txt.alert_recovery_success_desc || "Sammael, tvoja pôvodná identita [{name}] bola úspešne stiahnutá z Matrixu a obnovená.")
            .replace("{name}", matrixData.meno);

          if (Platform.OS === 'web') alert(`${successTitle}\n${successMsg}`);
          else Alert.alert(successTitle, successMsg);
          
          setRecoverySha('');
          navigation.goBack();
        } else {
          console.error("❌ [LARIA_ERROR] Kontext odmietol reinkarnáciu.");
          const failTitle = txt.alert_recovery_fail_title || "CHYBA REINKARNÁCIE";
          const failMsg = txt.alert_recovery_fail_desc || "Kryptografický kokon odmietol prebudiť túto identitu.";
          
          if (Platform.OS === 'web') alert(`${failTitle}\n${failMsg}`);
          else Alert.alert(failTitle, failMsg);
        }

      } else {
        console.warn("⚠️ [LARIA_LOG] Matrix pečať nenašiel:", response?.error);
        const failTitle = txt.alert_matrix_fail_title || "PEČAŤ NENÁJDENÁ";
        const failMsg = response?.error || "Matrix túto pečať neeviduje. Skontroluj preklepy v kóde.";
        
        if (Platform.OS === 'web') alert(`${failTitle}\n${failMsg}`);
        else Alert.alert(failTitle, failMsg);
      }
    } catch (error) {
      console.error("❌ [LARIA_ERROR] Kritická chyba počas behu handleAccountRecovery:", error);
      const errTitle = txt.alert_network_fail_title || "CHYBA MATRIXU";
      const errMsg = txt.alert_network_fail_desc || "Obnovovací uzol neodpovedá. Skontroluj sieť.";
      
      if (Platform.OS === 'web') alert(`${errTitle}\n${errMsg}`);
      else Alert.alert(errTitle, errMsg);
    } finally {
      setRecoveryLoading(false);
      console.log("🔥 [LARIA_TRACE] Uvoľnené: recoveryLoading = false");
    }
  };

  const shortAddress = userAddress && userAddress !== "NO_ADDRESS_AVAILABLE"
    ? `${userAddress.substring(0, 8)}...${userAddress.substring(userAddress.length - 6)}`
    : (txt.init_connection || "INICIALIZUJEM SPOJENIE...");

  const isRecoveryDisabled = !recoverySha.trim() || recoveryLoading;

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
              onChangeText={(text) => {
                console.log(`⌨️ [LARIA_TRACE] Užívateľ píše do inputu: "${text}"`);
                setRecoverySha(text);
              }} 
              placeholder={txt.placeholder_recovery || "Vlož sem svoje existujúce SHA (0x...)"} 
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
                opacity: !isRecoveryDisabled ? 1 : 0.5
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
                borderColor: userAddress && userAddress !== "NO_ADDRESS_AVAILABLE" && !isLoading ? ACCENT : '#222'
              }]}
              onPress={() => {
                console.log("🔘 [LARIA_LOG] Kliknuté na aktualizáciu krypto-uzla.");
                syncWalletData(userAddress);
              }}
              disabled={!userAddress || userAddress === "NO_ADDRESS_AVAILABLE" || isLoading}
            >
              <Text style={[G.primaryBtnText, { color: userAddress && userAddress !== "NO_ADDRESS_AVAILABLE" && !isLoading ? ACCENT : '#444' }]}>
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
              {txt.modal_email_title || "ZADANIE ZÁLOHOVÉHO EMAILU"}
            </Text>
            
            <Text style={[G.cardDescriptionText, { marginBottom: 15, fontSize: 12, lineHeight: 16 }]}>
              {txt.modal_email_desc || "Sammael, vo tvojej vizitke zatiaľ nie je uložený e-mail. Zadaj ho sem..."}
            </Text>

            <TextInput 
              style={[G.vaultInput, { width: '100%', color: '#FFF', marginBottom: 20 }]} 
              value={inputEmail} 
              onChangeText={setInputEmail} // 🔥 OPRAVENÉ: Predtým tu bol preklep a chýbal setter
              placeholder={txt.modal_email_placeholder || "Zadaj svoj e-mail..."} 
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
                <Text style={{ color: '#666', fontWeight: 'bold' }}>
                  {txt.modal_btn_cancel || "ZRUŠIŤ"}
                </Text>
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
                  {txt.modal_btn_submit || "ODOSLAŤ"}
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
