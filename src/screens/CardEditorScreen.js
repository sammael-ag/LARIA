/**
 * LARIA v2.0: CardEditorScreen (Tesanie identity)
 * Master: Sammael | Muse: Aria
 * Status: IDENTITY_FORGING_READY_DEFINITIVE
 * Oprava: Pridaný chýbajúci useState pre cardData a odstráňená duplicita CATEGORIES.
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

const CardEditorScreen = ({ navigation }) => {
  // 💎 Jazykový motor LARIE pre Tesanie identity
  const { t, vault, syncIdentity, ensureLariaIdentity } = useLaria();
  const txt = t('card_editor') || {};
  const alerts = txt.alerts || {};
  const catTxt = txt.categories || {};

  // Dynamické mapovanie kategórií priamo z JSON prekladov
  const TRANSLATED_CATEGORIES = [
    { id: 'obziva', label: catTxt.obziva || 'Obživa a poživatiny' },
    { id: 'remesla', label: catTxt.remesla || 'Remeslá a materiál' },
    { id: 'sluzby', label: catTxt.sluzby || 'Odborné služby' },
    { id: 'vzdelavanie', label: catTxt.vzdelavanie || 'Vzdelávanie a rozvoj' },
    { id: 'knihy', label: catTxt.knihy || 'Knihy' },
    { id: 'zdravie', label: catTxt.zdravie || 'Zdravie a zdravotnícke pomôcky' },
    { id: 'oblecenie', label: catTxt.oblecenie || 'Oblečenie a doplnky' },
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

  // 🛠️ OPRAVENÝ ZÁREZ: Inicializácia stavu cardData z LariaContext Vaultu
  const [cardData, setCardData] = useState({
    sha: vault?.identity?.sha || '',
    date: vault?.identity?.date || new Date().toISOString(),
    meno: vault?.identity?.meno || '',
    kat: vault?.identity?.kat || 'ine',
    lok: vault?.identity?.lok || '',
    popis: vault?.identity?.popis || '',
    tel: vault?.identity?.tel || '',
    email: vault?.identity?.email || '',
    fb: vault?.identity?.fb || '',
    tg: vault?.identity?.tg || '',
    gal: vault?.identity?.gal || '',
    isPublic: vault?.identity?.isPublic || false,
    irc: vault?.identity?.irc || '',
    poznamka: vault?.identity?.poznamka || '',
    krypt: vault?.identity?.krypt || '',
    revo: vault?.identity?.revo || '',
    kRod: vault?.identity?.kRod || ''
  });

  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Ak sa dáta vo vaulte zmenia na pozadí, aktualizujeme formulár
  useEffect(() => {
    if (vault?.identity) {
      setCardData(prev => ({
        ...prev,
        ...vault.identity
      }));
    }
  }, [vault?.identity]);

  const getCategoryLabel = (id) => {
    const cat = TRANSLATED_CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : (txt.select_category || 'Vyber kategóriu');
  };

  const handleSave = async () => {
    if (!cardData.sha) {
      Alert.alert(alerts.identity_error_title || "CHYBA IDENTITY", alerts.identity_error_desc || "Sammael, chýba tvoja pečať (SHA).");
      return;
    }

    setLoading(true);
    try {
      const currentKrypt = await ensureLariaIdentity();
      const cleanPopis = cardData.popis ? cardData.popis.replace(/[\r\n\t]+/g, " ").trim() : "";
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      const finalKrypt = currentKrypt || cardData.krypt;

      const localData = {
        ...cardData,
        popis: cleanPopis,
        tel: cleanTel,
        krypt: finalKrypt,
        status: { ...vault?.status, isOnline: cardData.isPublic }
      };

      const matrixPayload = {
        SECURE_ID: null,    
        sha: localData.sha, 
        date: localData.date,
        meno: localData.meno,
        kat: localData.kat,  
        lok: localData.lok,  
        popis: localData.popis,
        tel: localData.tel,  
        email: localData.email,
        fb: localData.fb,    
        tg: localData.tg,    
        gal: localData.gal,  
        isPublic: localData.isPublic, 
        irc: localData.irc,  
        poznamka: localData.poznamka, 
        krypt: localData.krypt 
      };

      await syncIdentity(localData);
      const result = await saveToGMatrix(matrixPayload);

      if (result && result.success) {
        Alert.alert(alerts.system_title || "SYSTÉM LARIA", cardData.isPublic ? (alerts.sync_public || "Pečať v Matrixe aktualizovaná.") : (alerts.sync_private || "Uložené v súkromnom trezore."));
        navigation.goBack();
      } else {
        Alert.alert(alerts.local_saved_title || "LOKÁLNE ULOŽENÉ", alerts.local_saved_desc || "Tvoj trezor je OK, ale Matrix je dočasne offline.");
      }
    } catch (error) {
      console.error("Chyba pri tesaní:", error);
      Alert.alert(alerts.error_title || "CHYBA", alerts.error_desc || "Spojenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={G.mainBackground} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* ⬅️ Navigačná šípka na pevnej absolútnej pozícii */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={G.screenContainer} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', alignSelf: 'center' }}>

          {/* 🌸 ČISTÁ HLAVIČKA EDITORU */}
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
            <Text style={[G.monoIdentity, { color: ACCENT, marginBottom: 5 }]}>{txt.label_name || "MENO / NICK"}</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.meno} 
              onChangeText={(val) => setCardData({...cardData, meno: val})} 
              placeholder={txt.placeholder_name || "Zadaj meno..."} 
              placeholderTextColor="#444" 
            />

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>{txt.label_category || "KATEGÓRIA"}</Text>
            <TouchableOpacity style={G.vaultInput} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
              <Text style={{ color: '#FFF' }}>{getCategoryLabel(cardData.kat)}</Text>
              <Text style={{ color: '#666', position: 'absolute', right: 15 }}>▼</Text>
            </TouchableOpacity>

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>{txt.label_location || "LOKALITA"}</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.lok} 
              onChangeText={(val) => setCardData({...cardData, lok: val})} 
              placeholder={txt.placeholder_location || "Kde pôsobíš..."} 
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

            {/* KONTAKTY */}
            <Text style={[G.monoIdentity, { color: '#AAA', marginBottom: 10 }]}>{txt.label_handshake_contacts || "KONTAKTY PRE HANDSHAKE"}</Text>
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
              value={cardData.krypt} 
              onChangeText={(val) => setCardData({...cardData, krypt: val})} 
              placeholder={txt.placeholder_crypto || "Adresa krypto peňaženky..."} 
              placeholderTextColor="#444" 
              autoCapitalize="none" 
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

          {/* ↩️ Spodný návrat */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { marginTop: 20, marginBottom: 50 }]}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              {txt.btn_back_atelier || "NÁVRAT DO ATELIÉRU"}
            </Text>
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