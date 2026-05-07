import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar,
  Alert, Switch, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G } from '../styles/styles'; 
import { saveToGMatrix } from '../services/GMatrixService'; 
import { useLaria } from '../../context/LariaContext';

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

  // --- INICIALIZÁCIA (Používame čisté premenné z trezoru) ---
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
    poznamka: vault.identity.poznamka || '', // Tu je tvoj FING z Contextu
    krypt: vault.identity.krypt || '',
    // Lokálne len pre trezor
    revo: vault.identity.revo || '',
    kRod: vault.identity.kRod || ''
  });

  const getCategoryLabel = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : 'Vyber kategóriu';
  };

  const handleSave = async () => {
    if (!cardData.sha) {
      Alert.alert("Chyba identity", "Sammael, chýba tvoja pečať (SHA).");
      return;
    }

    setLoading(true);
    try {
      const currentKrypt = await ensureLariaIdentity();
      const cleanPopis = cardData.popis ? cardData.popis.replace(/[\r\n\t]+/g, " ").trim() : "";
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      // 1. LOKÁLNY TREZOR (Všetko)
      const localData = {
        ...cardData,
        popis: cleanPopis,
        tel: cleanTel,
        krypt: currentKrypt || cardData.krypt,
        status: { ...vault.status, isOnline: cardData.isPublic }
      };

      // 2. MATRIX PAYLOAD (Presné poradie stĺpcov tabuľky: A, B, C, D...)
      const matrixPayload = {
        SECURE_ID: null,    // A
        sha: localData.sha, // B
        date: localData.date,// C
        meno: localData.meno,// D
        kat: localData.kat,  // E
        lok: localData.lok,  // F
        popis: localData.popis,// G
        tel: localData.tel,  // H
        email: localData.email,// I
        fb: localData.fb,    // J
        tg: localData.tg,    // K
        gal: localData.gal,  // L
        isPublic: localData.isPublic, // M
        irc: localData.irc,  // N
        poznamka: localData.poznamka, // O (Tvoj FING)
        krypt: localData.krypt // P
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
    <SafeAreaView style={G.bg} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HEADER */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ZRUŠIŤ ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>TESANIE IDENTITY</Text>
          <View style={{ width: 8, height: 8, backgroundColor: cardData.isPublic ? '#b19cd9' : '#333', borderRadius: 4 }} />
        </View>

        {/* REŽIM VYSIELANIA */}
        <View style={[G.terminalInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: cardData.isPublic ? '#b19cd9' : '#333', marginBottom: 25 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[G.textCyber, { color: cardData.isPublic ? '#b19cd9' : '#666' }]}>REŽIM VYSIELANIA</Text>
            <Text style={{ color: '#444', fontSize: 10 }}>{cardData.isPublic ? 'VEREJNÉ - Vysielam do Matrixu' : 'SÚKROMNÉ - Iba v trezore'}</Text>
          </View>
          <Switch 
            onValueChange={(val) => setCardData({...cardData, isPublic: val})} 
            value={cardData.isPublic} 
            trackColor={{ false: "#222", true: "#4b3d61" }} 
            thumbColor={cardData.isPublic ? "#b19cd9" : "#444"} 
          />
        </View>

        {/* FORMULÁR */}
        <Text style={[G.textCyber, { color: '#b19cd9' }]}>MENO / NICK</Text>
        <TextInput style={G.terminalInput} value={cardData.meno} onChangeText={(val) => setCardData({...cardData, meno: val})} placeholder="Meno..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#b19cd9' }]}>KATEGÓRIA</Text>
        <TouchableOpacity style={[G.terminalInput, { justifyContent: 'center' }]} onPress={() => setShowPicker(true)}>
          <Text style={{ color: '#FFF' }}>{getCategoryLabel(cardData.kat)}</Text>
          <Text style={{ color: '#666', position: 'absolute', right: 15 }}>▼</Text>
        </TouchableOpacity>

        <Text style={[G.textCyber, { color: '#b19cd9' }]}>LOKALITA</Text>
        <TextInput style={G.terminalInput} value={cardData.lok} onChangeText={(val) => setCardData({...cardData, lok: val})} placeholder="Kde..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#b19cd9' }]}>VÍZIA / POPIS</Text>
        <TextInput style={[G.terminalInput, { height: 70, textAlignVertical: 'top' }]} multiline numberOfLines={3} value={cardData.popis} onChangeText={(val) => setCardData({...cardData, popis: val})} placeholder="Popis..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#b19cd9' }]}>GALÉRIA (LINK)</Text>
        <TextInput style={G.terminalInput} value={cardData.gal} onChangeText={(val) => setCardData({...cardData, gal: val})} placeholder="https://..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <Text style={[G.textCyber, { color: '#b19cd9' }]}>IRC NICK</Text>
        <TextInput style={G.terminalInput} value={cardData.irc} onChangeText={(val) => setCardData({...cardData, irc: val})} placeholder="@nick..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <View style={G.divider} />

        {/* KONTAKTY PRE HANDSHAKE */}
        <Text style={[G.textCyber, { color: '#AAA' }]}>KONTAKTY PRE HANDSHAKE</Text>
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} keyboardType="phone-pad" value={cardData.tel} onChangeText={(val) => setCardData({...cardData, tel: val})} placeholder="Telefón..." placeholderTextColor={G.placeholderColor} />
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} value={cardData.email} onChangeText={(val) => setCardData({...cardData, email: val})} placeholder="E-mail..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} value={cardData.fb} onChangeText={(val) => setCardData({...cardData, fb: val})} placeholder="Facebook..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />
        <TextInput style={G.terminalInput} value={cardData.tg} onChangeText={(val) => setCardData({...cardData, tg: val})} placeholder="Telegram..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <View style={G.divider} />
        
        {/* LOKÁLNE FINANCIE */}
        <Text style={[G.textCyber, { color: '#666' }]}>FINANCIE (IBA LOKÁLNE)</Text>
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} value={cardData.revo} onChangeText={(val) => setCardData({...cardData, revo: val})} placeholder="Revolut @nick" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />
        <TextInput style={G.terminalInput} value={cardData.kRod} onChangeText={(val) => setCardData({...cardData, kRod: val})} placeholder="KorunyROD účet" placeholderTextColor={G.placeholderColor} />

        <TouchableOpacity 
          style={[G.ircButton, { marginTop: 30, borderColor: cardData.isPublic ? '#b19cd9' : '#333', opacity: loading ? 0.5 : 1, marginBottom: 50 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#b19cd9" />
          ) : (
            <Text style={[G.ircButtonText, { color: cardData.isPublic ? '#b19cd9' : '#666' }]}>
              [ {cardData.isPublic ? 'VYSLAŤ DO MATRIXU' : 'ULOŽIŤ SÚKROMNE'} ]
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL PICKER */}
      <Modal visible={showPicker} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#050505', borderWidth: 1, borderColor: '#1a1a1a', maxHeight: '80%', borderRadius: 12 }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[G.textCyber, { color: '#b19cd9' }]}>VÝBER KATEGÓRIE</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ color: '#666' }}>[ ZAVRIEŤ ]</Text>
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
                  <Text style={{ color: cardData.kat === item.id ? '#b19cd9' : '#444' }}>{item.label}</Text>
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