/**
 * LARIA v2.0: CardEditorScreen (Tesanie identity)
 * Master: Sammael | Muse: Aria
 * Status: IDENTITY_FORGING_READY_DEFINITIVE
 * Oprava: Vrátené vizuálne polia pre Google Galériu (gal) a Krypto peňaženku (krypt).
 */

import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar,
  Alert, Switch, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G, ACCENT } from '../styles/styles'; 
import { saveToGMatrix } from '../services/GMatrixService'; 
import { useLaria } from '../context/LariaContext';

const CATEGORIES = [
  { id: 'obziva', label: 'Obživa a poživatiny' },
  { id: 'remesla', label: 'Remeslá a materiál' },
  { id: 'sluzby', label: 'Odborné služby' },
  { id: 'vzdelavanie', label: 'Vzdelávanie a rozvoj' },
  { id: 'knihy', label: 'Knihy' },
  { id: 'zdravie', label: 'Zdravie a zdravotnícke pomôcky' },
  { id: 'oblecenie', label: 'Oblečenie a doplnky' },
  { id: 'auto', label: 'Auto-moto' },
  { id: 'volno', label: 'Zážitkové aktivity a voľný čas' },
  { id: 'elektro', label: 'Elektro - čierna/biela technika' },
  { id: 'rodina', label: 'Deti a rodina' },
  { id: 'ubytovanie', label: 'Ubytovanie a prenájom' },
  { id: 'zahrada', label: 'Záhrada a gazdovstvo' },
  { id: 'nabytok', label: 'Nábytok a zariadenie domácnosti' },
  { id: 'kultura', label: 'Kultúra a umenie' },
  { id: 'osobne', label: 'Osobné služby' },
  { id: 'tvorba', label: 'Ručné práce a tvorba' },
  { id: 'ine', label: 'Iné' },
];

const CardEditorScreen = ({ navigation }) => {
  const { vault, syncIdentity, ensureLariaIdentity } = useLaria();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // --- INICIALIZÁCIA ---
  const [cardData, setCardData] = useState({
    sha: vault.identity.sha, 
    date: vault.identity.date || new Date().toISOString().split('T')[0],
    meno: vault.identity.meno || '',
    kat: vault.identity.kat || 'remesla', 
    lok: vault.identity.lok || '',
    popis: vault.identity.popis || '',
    tel: vault.identity.tel || '',
    email: vault.identity.email || '',
    fb: vault.identity.fb || '',
    tg: vault.identity.tg || '',
    gal: vault.identity.gal || '',
    isPublic: vault.status.isOnline || false,
    irc: vault.identity.irc || '', 
    poznamka: vault.identity.poznamka || '', 
    krypt: vault.identity.krypt || '',
    revo: vault.identity.revo || '',
    kRod: vault.identity.kRod || ''
  });

  const getCategoryLabel = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : 'Vyber kategóriu';
  };

  const handleSave = async () => {
    if (!cardData.sha) {
      Alert.alert("CHYBA IDENTITY", "Sammael, chýba tvoja pečať (SHA).");
      return;
    }

    setLoading(true);
    try {
      const currentKrypt = await ensureLariaIdentity();
      const cleanPopis = cardData.popis ? cardData.popis.replace(/[\r\n\t]+/g, " ").trim() : "";
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      // Poistenie krypto kľúča: Ak máme staré SHA heslo a nanovo vygenerovaný kľúč zlyhá, udržíme existujúci
      const finalKrypt = currentKrypt || cardData.krypt;

      const localData = {
        ...cardData,
        popis: cleanPopis,
        tel: cleanTel,
        krypt: finalKrypt,
        status: { ...vault.status, isOnline: cardData.isPublic }
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
        Alert.alert("SYSTÉM LARIA", cardData.isPublic ? "Pečať v Matrixe aktualizovaná." : "Uložené v súkromnom trezore.");
        navigation.goBack();
      } else {
        Alert.alert("LOKÁLNE ULOŽENÉ", "Tvoj trezor je OK, ale Matrix je dočasne offline.");
      }
    } catch (error) {
      console.error("Chyba pri tesaní:", error);
      Alert.alert("CHYBA", "Spojenie zlyhalo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={G.mainBackground} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* ⬅️ PRE PROGRESÍVCOV: Navigačná šípka na pevnej absolútnej pozícii */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={G.screenContainer} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', alignSelf: 'center' }}>

          {/* HEADER */}
          <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 25 }}>
            <Text style={G.atelierTitle}>TESANIE IDENTITY</Text>
            <View style={[G.statusDot, { backgroundColor: cardData.isPublic ? ACCENT : '#333', marginTop: 10 }]} />
          </View>

          {/* REŽIM VYSIELANIA */}
          <View style={[G.card, { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftColor: cardData.isPublic ? ACCENT : '#333' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[G.cardTitleText, { fontSize: 14, color: cardData.isPublic ? ACCENT : '#666' }]}>REŽIM VYSIELANIA</Text>
              <Text style={[G.statusTextSmall, { marginTop: 2 }]}>
                {cardData.isPublic ? 'VEREJNÉ - Vysielam do Matrixu' : 'SÚKROMNÉ - Iba v trezore'}
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
            <Text style={[G.monoIdentity, { color: ACCENT, marginBottom: 5 }]}>MENO / NICK</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.meno} 
              onChangeText={(val) => setCardData({...cardData, meno: val})} 
              placeholder="Zadaj meno..." 
              placeholderTextColor="#444" 
            />

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>KATEGÓRIA</Text>
            <TouchableOpacity style={G.vaultInput} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
              <Text style={{ color: '#FFF' }}>{getCategoryLabel(cardData.kat)}</Text>
              <Text style={{ color: '#666', position: 'absolute', right: 15 }}>▼</Text>
            </TouchableOpacity>

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>LOKALITA</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.lok} 
              onChangeText={(val) => setCardData({...cardData, lok: val})} 
              placeholder="Kde pôsobíš..." 
              placeholderTextColor="#444" 
            />

            <Text style={[G.monoIdentity, { color: ACCENT, marginTop: 15, marginBottom: 5 }]}>VÍZIA / POPIS</Text>
            <TextInput 
              style={[G.vaultInput, { height: 80, textAlignVertical: 'top' }]} 
              multiline 
              numberOfLines={3} 
              value={cardData.popis} 
              onChangeText={(val) => setCardData({...cardData, popis: val})} 
              placeholder="Tvoj príbeh..." 
              placeholderTextColor="#444" 
            />

            <View style={G.divider} />

            {/* KONTAKTY */}
            <Text style={[G.monoIdentity, { color: '#AAA', marginBottom: 10 }]}>KONTAKTY PRE HANDSHAKE</Text>
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} keyboardType="phone-pad" value={cardData.tel} onChangeText={(val) => setCardData({...cardData, tel: val})} placeholder="Telefón..." placeholderTextColor="#444" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.email} onChangeText={(val) => setCardData({...cardData, email: val})} placeholder="E-mail..." placeholderTextColor="#444" autoCapitalize="none" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.fb} onChangeText={(val) => setCardData({...cardData, fb: val})} placeholder="Facebook link..." placeholderTextColor="#444" autoCapitalize="none" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.tg} onChangeText={(val) => setCardData({...cardData, tg: val})} placeholder="Telegram nick..." placeholderTextColor="#444" autoCapitalize="none" />
            
            {/* 🛠️ OPRAVENÝ ZÁREZ 1: Google Fotoalbum / Portfólio */}
            <Text style={[G.monoIdentity, { color: ACCENT, marginBottom: 5 }]}></Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.gal} 
              onChangeText={(val) => setCardData({...cardData, gal: val})} 
              placeholder="Google Fotoalbum link..." 
              placeholderTextColor="#444" 
              autoCapitalize="none" 
            />

            <View style={G.divider} />
            
            {/* LOKÁLNE FINANCIE */}
            <Text style={[G.monoIdentity, { color: '#666', marginBottom: 10 }]}>FINANCIE (IBA LOKÁLNE)</Text>
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.revo} onChangeText={(val) => setCardData({...cardData, revo: val})} placeholder="Revolut @nick" placeholderTextColor="#444" autoCapitalize="none" />
            <TextInput style={[G.vaultInput, { marginBottom: 10 }]} value={cardData.kRod} onChangeText={(val) => setCardData({...cardData, kRod: val})} placeholder="KorunyROD účet" placeholderTextColor="#444" />
            
            {/* 🛠️ OPRAVENÝ ZÁREZ 2: Krypto peňaženka pre reinkarnáciu identity */}
            <Text style={[G.monoIdentity, { color: '#666', marginTop: 5, marginBottom: 5 }]}>KRYPTO PEŇAŽENKA (HESLO SECURE)</Text>
            <TextInput 
              style={G.vaultInput} 
              value={cardData.krypt} 
              onChangeText={(val) => setCardData({...cardData, krypt: val})} 
              placeholder="Adresa krypto peňaženky..." 
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
                {cardData.isPublic ? 'VYSLAŤ DO MATRIXU' : 'ULOŽIŤ SÚKROMNE'}
              </Text>
            )}
          </TouchableOpacity>

          {/* ↩️ PRE KONZERVATÍVCOV: Spodný návrat */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { marginTop: 20, marginBottom: 50 }]}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* MODAL PICKER */}
      <Modal visible={showPicker} transparent={true} animationType="fade">
        <View style={G.modalOverlay}>
          <View style={{ backgroundColor: '#050505', borderWidth: 1, borderColor: '#1a1a1a', width: '90%', maxWidth: 450, maxHeight: '80%', borderRadius: 12 }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[G.monoIdentity, { color: ACCENT }]}>VÝBER KATEGÓRIE</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ color: '#666' }}>ZAVRIEŤ</Text>
              </TouchableOpacity>
            </View>
            <FlatList 
              data={CATEGORIES}
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