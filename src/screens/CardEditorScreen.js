/**
 * LARIA v2.5.1: CardEditorScreen (Tesanie identity s Proof of Human Action)
 * Master: Sammael | Muse: Aria
 * Status: CRYPTO_FORGING_ACTIVE_DEFINITIVE | SAFETY_SHIELD_ACTIVATED
 * Oprava: Odstránená schizofrénia a šum premennej "poznamka" (všade sa používa už len "fing").
 * Smerovanie: Implementovaná transportná premenná "Signal" pre radar a bleskové notifikácie.
 * Bezpečnosť: tel, email, fb, tg, revo, kRod žijú VÝHRADNE v trezore pre P2P Handshake.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar,
  Alert, Switch, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G, ACCENT } from '../styles/styles'; 
import { saveToGMatrix } from '../services/GMatrixService'; 
import { useLaria } from '../context/LariaContext';
import { signLariaFing } from '../services/LariaLogic'; 

const CardEditorScreen = ({ navigation }) => {
  const { t, vault, syncIdentity, ensureLariaIdentity, generateAndSaveFirstSHA, jazyk } = useLaria();
  const txt = t('card_editor') || {};
  const alerts = txt.alerts || {};
  const catTxt = txt.categories || {};

  const TRANSLATED_CATEGORIES = [
    { id: 'obziva', label: catTxt.obziva || 'Obživa a poživatiny' },
    { id: 'remesla', label: catTxt.remesla || 'Remeslá a materiál' },
    { id: 'sluzby', label: catTxt.sluzby || 'Odborné služby' },
    { id: 'vzdelavanie', label: catTxt.vzdelavanie || 'Vzdelávanie a rozvoj' },
    { id: 'knihy', label: catTxt.knihy || 'Knihy' },
    { id: 'zdravie', label: catTxt.zdravie || 'Zdravie a zdravotnícke pomôcky' },
    { id: 'oblecenie', label: catTxt.oblecenie || 'Oplečenie a doplnky' },
    { id: 'auto', label: catTxt.auto || 'Auto-moto' },
    { id: 'volno', label: catTxt.volno || 'Zážitkové aktivity a voľný čas' },
    { id: 'elektro', label: catTxt.elektro || 'Elektro - čierna/biela technika' },
    { id: 'rodina', label: catTxt.rodina || 'Deti a rodina' },
    { id: 'ubytovanie', label: catTxt.ubytovanie || 'Ubytovanie a prenájom' },
    { id: 'zahrada', label: catTxt.zahrada || 'Záhrada a gazdovstvo' },
    { id: 'nabytok', label: catTxt.nabytok || 'Nábytok a zariadenie domácnosti' },
    { id: 'kultura', label: catTxt.kultura || 'Kultúra a umenie' },
    { id: 'osobne', label: catTxt.osobne || 'Osobné služby' },
    { id: 'tvorba', label: catTxt.tvorba || 'Ručné práce a tvorba' },
    { id: 'ine', label: catTxt.ine || 'Iné' },
  ];

  // 🛠️ INICIALIZÁCIA STAVU: Pridaná premenná Signal, zjednotený "jazyk", bez "poznamka"
  const [cardData, setCardData] = useState({
    sha: vault?.identity?.sha || '',
    date: vault?.identity?.date || new Date().toISOString(),
    meno: vault?.identity?.meno || '',
    kat: vault?.identity?.kat || '', 
    lok: vault?.identity?.lok || '',
    popis: vault?.identity?.popis || '',
    tel: vault?.identity?.tel || '',
    email: vault?.identity?.email || '',
    fb: vault?.identity?.fb || '',
    tg: vault?.identity?.tg || '',
    gal: vault?.identity?.gal || '',
    isPublic: vault?.identity?.isPublic !== undefined ? vault.identity.isPublic : true, 
    Signal: vault?.identity?.Signal || '', // 📡 Smerovacia adresa pre radar
    jazyk: vault?.identity?.jazyk || jazyk || 'sk', 
    krypt: vault?.identity?.krypt || '',
    revo: vault?.identity?.revo || '',
    kRod: vault?.identity?.kRod || ''
  });

  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (vault?.identity) {
      setCardData(prev => ({ 
        ...prev, 
        ...vault.identity,
        jazyk: vault.identity.jazyk || jazyk || 'sk',
        isPublic: vault.identity.isPublic !== undefined ? vault.identity.isPublic : true,
        Signal: vault.identity.Signal || '' // 📡 Ochrana stavu pri aktualizácii z trezoru
      }));
    }
  }, [vault?.identity, jazyk]);

  const getCategoryLabel = (id) => {
    const cat = TRANSLATED_CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : (txt.select_category || 'Vyber kategóriu *');
  };

  const handleSave = async () => {
    if (honeypot.trim() !== '') {
      console.log("🤖 LARIA_SECURITY: Bot uviazol v medovom hrnci. Akcia simulovaná.");
      navigation.goBack();
      return;
    }

    // 🛡️ STRIKTNÁ VALIDÁCIA POVINNÝCH POLÍ
    if (!cardData.meno || cardData.meno.trim() === "") {
      Alert.alert("CHYBA VSTUPU", "Sammael, pole MENO / NICK je povinné.");
      return;
    }
    if (!cardData.kat || cardData.kat.trim() === "") {
      Alert.alert("CHYBA VSTUPU", "Sammael, vyber prosím KATEGÓRIU tvojho pôsobenia.");
      return;
    }
    if (!cardData.lok || cardData.lok.trim() === "") {
      Alert.alert("CHYBA VSTUPU", "Sammael, pole LOKALITA je povinné pre zobrazenie na mape.");
      return;
    }

    setLoading(true);
    try {
      // 1. 🔥 KRYPTO-ZROD: Získame alebo vygenerujeme peňaženku
      const currentKryptWallet = await ensureLariaIdentity(); 
      
      const walletAddress = currentKryptWallet?.address || cardData.krypt || vault?.identity?.krypt;
      const privateKey = currentKryptWallet?.privateKey || vault?.identity?.privateKey;

      console.log("💎 [CardEditor] Odchytená adresa pre bezpečný transport:", walletAddress);

      let activeSha = cardData.sha;

      if (!activeSha) {
        console.log("⚙️ LARIA_LOGIC: Prvý zrod identity! Melieme meno do posvätného SHA...");
        const newIdentity = await generateAndSaveFirstSHA(cardData.meno.trim());
        if (newIdentity && newIdentity.sha) {
          activeSha = newIdentity.sha;
        } else {
          throw new Error("Nepodarilo sa vygenerovať SHA identitu.");
        }
      }

      const fing = activeSha.substring(0, 12);
      
      // Podpis chrániaci odtlačok prsta (fing)
      const cryptoSignature = await signLariaFing(privateKey, fing);

      const cleanPopis = cardData.popis ? cardData.popis.replace(/[\r\n\t]+/g, " ").trim() : "";
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      // 3. Pripravíme lokálne dáta pre vnútorný trezor (Vault) - Tu zostáva kompletný balík pre Handshake
      const localData = {
        ...cardData,
        sha: activeSha,
        popis: cleanPopis,
        tel: cleanTel,
        krypt: walletAddress, 
        status: { ...vault?.status, isOnline: cardData.isPublic }
      };

      // 4. 🔥 MATRIX SHIELD PAYLOAD: Skladáme orezaný balíček vrátane premennej Signal pre radar
      const matrixPayload = {
        honeypot_check: "human", 
        sha: activeSha, 
        fing: fing,             
        signature: cryptoSignature, 
        date: localData.date,
        meno: localData.meno,
        kat: localData.kat,  
        lok: localData.lok,  
        popis: localData.popis,
        gal: localData.gal,  
        isPublic: localData.isPublic, 
        Signal: localData.Signal, // 📡 Transportujeme smerovaciu adresu pre sieťové doručenie správ
        jazyk: localData.jazyk || 'sk', 
        krypt: walletAddress 
      };

      // Najprv asynchrónne zapečatíme lokálny trezor (všetky P2P premenné sú tu v bezpečí)
      await syncIdentity(localData);
      
      let result = { success: true };
      if (cardData.isPublic) {
        console.log("📤 [CardEditor] Odpaľujem bezpečný, orezaný payload do Matrixu...");
        result = await saveToGMatrix(matrixPayload);
      }

      if (result && result.success) {
        Alert.alert(
          alerts.system_title || "SYSTÉM LARIA", 
          cardData.isPublic ? (alerts.sync_public || "Pečať v Matrixe aktualizovaná.") : (alerts.sync_private || "Uložené v súkromnom trezore.")
        );
        navigation.goBack();
      } else {
        Alert.alert(alerts.local_saved_title || "LOKÁLNE ULOŽENÉ", alerts.local_saved_desc || "Tvoj trezor je OK, ale Matrix je dočasne offline.");
      }
    } catch (error) {
      console.error("❌ Chyba pri tesaní a prenose do Matrixu:", error);
      Alert.alert(alerts.error_title || "CHYBA", alerts.error_desc || "Spojenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={G.mainBackground} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={G.screenContainer} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', alignSelf: 'center' }}>

          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>{txt.title || "Edit vizitky"}</Text>
          </View>

          {/* REŽIM VYSIELANIA */}
          <View style={[G.card, { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftColor: cardData.isPublic ? ACCENT : '#333' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[G.cardTitleText, { fontSize: 14, color: cardData.isPublic ? ACCENT : '#666' }]}>{txt.broadcast_mode || "REŽIM VYSIELANIA"}</Text>
              <Text style={[G.statusTextSmall, { marginTop: 2 }]}>
                {cardData.isPublic ? (txt.public_status || 'VEREJNÉ - Vysielam do Matrixu') : (txt.private_status || 'SÚKROMNÉ - Iba v trezore')}
              </Text>
            </View>
            <Switch 
              onValueChange={(val) => setCardData({...cardData, isPublic: val})} 
              value={cardData.isPublic} 
              trackColor={{ false: "#222", true: "#4b3d61" }} 
              thumbColor={cardData.isPublic ? ACCENT : "#444"} 
            />
          </View>

          {/* FORMULÁR */}
          <View style={{ width: '100%', alignItems: 'flex-start' }}>
            
            {/* 🍯 HONEYPOT COMPONENT */}
            <View style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}>
              <TextInput value={honeypot} onChangeText={setHoneypot} placeholder="Leave this empty" tabIndex={-1} />
            </View>

            <Text style={[G.monoIdentity, { color: ACCENT, marginBottom: 5 }]}>{(txt.label_name || "MENO / NICK") + " *"}</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.meno} 
              onChangeText={(val) => setCardData({...cardData, meno: val})} 
              placeholder={txt.placeholder_name || "Zadaj meno (povinné)..."} 
              placeholderTextColor="#444" 
            />

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>{(txt.label_category || "KATEGÓRIA") + " *"}</Text>
            <TouchableOpacity style={G.vaultInput} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
              <Text style={{ color: cardData.kat ? '#FFF' : '#444' }}>{getCategoryLabel(cardData.kat)}</Text>
              <Text style={{ color: '#666', position: 'absolute', right: 15 }}>▼</Text>
            </TouchableOpacity>

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>{(txt.label_location || "LOKALITA") + " *"}</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.lok} 
              onChangeText={(val) => setCardData({...cardData, lok: val})} 
              placeholder={txt.placeholder_location || "Kde pôsobíš (povinné)..."} 
              placeholderTextColor="#444" 
            />

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>{txt.label_vision || "VÍZIA / POPIS"}</Text>
            <TextInput 
              style={[G.vaultInput, { height: 80, textAlignVertical: 'top' }]} 
              multiline 
              numberOfLines={3} 
              value={cardData.popis} 
              onChangeText={(val) => setCardData({...cardData, popis: val})} 
              placeholder={txt.placeholder_vision || "Tvoj príbeh..."} 
              placeholderTextColor="#444" 
            />

            <View style={G.divider} />

            {/* KONTAKTY PRE HANDSHAKE (Iba lokálny trezor) */}
            <Text style={[G.monoIdentity, { color: '#AAA', marginBottom: 10 }]}>{txt.label_handshake_contacts || "KONTAKTY PRE HANDSHAKE (BEZPEČNÝ LOKÁLNY TREZOR)"}</Text>
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} keyboardType="phone-pad" value={cardData.tel} onChangeText={(val) => setCardData({...cardData, tel: val})} placeholder={txt.placeholder_phone || "Telefón..."} placeholderTextColor="#444" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.email} onChangeText={(val) => setCardData({...cardData, email: val})} placeholder={txt.placeholder_email || "E-mail..."} placeholderTextColor="#444" autoCapitalize="none" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.fb} onChangeText={(val) => setCardData({...cardData, fb: val})} placeholder={txt.placeholder_fb || "Facebook link..."} placeholderTextColor="#444" autoCapitalize="none" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.tg} onChangeText={(val) => setCardData({...cardData, tg: val})} placeholder={txt.placeholder_tg || "Telegram nick..."} placeholderTextColor="#444" autoCapitalize="none" />
            
            {/* Portfólio / Galéria */}
            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>
              {txt.placeholder_gallery ? "PORTFÓLIO / GALÉRIA" : "PORTFÓLIO"}
            </Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.gal} 
              onChangeText={(val) => setCardData({...cardData, gal: val})} 
              placeholder={txt.placeholder_gallery || "Google Fotoalbum link..."} 
              placeholderTextColor="#444" 
              autoCapitalize="none" 
            />

            <View style={G.divider} />
            
            {/* LOKÁLNE FINANCIE */}
            <Text style={[G.monoIdentity, { color: '#666', marginBottom: 10 }]}>{txt.label_finance || "FINANCIE (IBA LOKÁLNE)"}</Text>
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.revo} onChangeText={(val) => setCardData({...cardData, revo: val})} placeholder="Revolut @nick" placeholderTextColor="#444" autoCapitalize="none" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.kRod} onChangeText={(val) => setCardData({...cardData, kRod: val})} placeholder="KorunyROD účet" placeholderTextColor="#444" />
            
            {/* Krypto peňaženka */}
            <Text style={[G.monoIdentity, { color: '#666', marginTop: 5, marginBottom: 5 }]}>{txt.label_crypto || "KRYPTO PEŇAŽENKA (HESLO SECURE)"}</Text>
            <TextInput 
              style={G.vaultInput} 
              editable={false} 
              value={cardData.krypt || vault?.identity?.krypt || ''} 
              placeholder={txt.placeholder_crypto || "Adresa krypto peňaženky sa vygeneruje..."} 
              placeholderTextColor="#444" 
            />
          </View>

          {/* HLAVNÝ SAVE BUTTON */}
          <TouchableOpacity 
            style={[G.primaryBtn, { marginTop: 30, width: '100%', backgroundColor: cardData.isPublic ? '#1a1a1a' : 'transparent', borderColor: cardData.isPublic ? ACCENT : '#333', opacity: loading ? 0.5 : 1 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ACCENT} />
            ) : (
              <Text style={[G.primaryBtnText, { color: cardData.isPublic ? ACCENT : '#666' }]}>
                {cardData.isPublic ? (txt.btn_broadcast || 'VYSLAŤ DO MATRIXU') : (txt.btn_save_private || 'ULOŽIŤ SÚKROMNE')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[G.backToAtelierBtn, { marginTop: 20, marginBottom: 50 }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={G.primaryBtnText}>{txt.btn_back_atelier || "NÁVRAT DO ATELIÉRU"}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* MODAL PICKER */}
      <Modal visible={showPicker} transparent={true} animationType="fade">
        <View style={G.modalOverlay}>
          <View style={{ backgroundColor: '#050505', borderWidth: 1, borderColor: '#1a1a1a', width: '90%', maxWidth: 450, maxHeight: '80%', borderRadius: 12 }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[G.monoIdentity, { color: ACCENT }]}>{txt.modal_title || "VÝBER KATEGÓRIE"}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ color: '#666' }}>{txt.modal_close || "ZAVRIEŤ"}</Text>
              </TouchableOpacity>
            </View>
            <FlatList 
              data={TRANSLATED_CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#111' }}
                  onPress={() => {
                    setCardData({ ...cardData, kat: item.id }); 
                    setShowPicker(false);
                  }}
                >
                  <Text style={{ color: cardData.kat === item.id ? ACCENT : '#FFF' }}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CardEditorScreen;