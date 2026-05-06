import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList
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

  const [cardData, setCardData] = useState({
    sha: vault.identity.sha, 
    kategoria: vault.identity.kategoria || 'remesla', 
    meno: vault.identity.name || vault.identity.meno || '',
    lok: vault.identity.lok || '',
    popis: vault.identity.popis || '',
    tel: vault.identity.tel || '',
    email: vault.identity.email || '',
    fb: vault.identity.fb || '',
    tg: vault.identity.tg || '',
    gal: vault.identity.gal || '',
    revo: vault.identity.revo || '',
    kRod: vault.identity.kRod || '',
    krypt: vault.identity.walletAddress || vault.identity.krypt || '', 
    isPublic: vault.status.isOnline || false 
  });

  const getCategoryLabel = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : 'Vyber kategóriu';
  };

  const handleSave = async () => {
    if (!cardData.sha) {
      Alert.alert("Chyba identity", "Chýba bezpečná pečať (SHA).");
      return;
    }

    setLoading(true);
    try {
      const currentWalletAddress = await ensureLariaIdentity();
      
      const cleanPopis = cardData.popis ? cardData.popis.replace(/[\r\n\t]+/g, " ").trim() : "";
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      // 1. DOMA - Kompletný balík pre lokálny trezor
      const localData = {
        ...cardData,
        popis: cleanPopis,
        tel: cleanTel,
        krypt: currentWalletAddress || cardData.krypt,
        status: {
          ...vault.status,
          isOnline: cardData.isPublic
        }
      };

      // 2. VONKU - Balík pre Vrátnika v7.9.2 (Kaviareň)
      const matrixData = {
        sha: localData.sha,
        meno: localData.meno,
        kategoria: localData.kategoria,
        lok: localData.lok,
        popis: localData.popis,
        tel: localData.tel,
        email: localData.email,
        fb: localData.fb,
        tg: localData.tg,
        gal: localData.gal,
        krypt: localData.krypt,
        // Manfred v kaviarni explicitne hľadá 'isPublic'
        isPublic: cardData.isPublic 
      };

      // Zapečatenie lokálneho trezoru
      await syncIdentity(localData);

      // Vyslanie do Matrixu (vždy aktualizujeme stav v tabuľke)
      const result = await saveToGMatrix(matrixData);

      if (result && (result.result === "success" || result.success)) {
        const successMsg = cardData.isPublic 
          ? "Pečať vytesaná. Manfred v kaviarni potvrdil príjem!" 
          : "Súkromne uložené. Matrix bol stiahnutý z obehu.";
        Alert.alert("SYSTÉM LARIA", successMsg);
      } else {
        Alert.alert("LOKÁLNE ULOŽENÉ", "Trezor OK, ale spojenie s kaviarňou zaváhalo.");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Chyba pri tesaní:", error);
      Alert.alert("CHYBA SPOJENIA", "Vrátnik neodpovedá. Skontroluj Wi-Fi / Dáta.");
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
          <View style={{ width: 8, height: 8, backgroundColor: cardData.isPublic ? '#0FF' : '#F0F', borderRadius: 4 }} />
        </View>

        {/* REŽIM SÚKROMIA */}
        <View style={[G.terminalInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: cardData.isPublic ? '#0FF' : '#F0F', marginBottom: 25 }]}>
          <View style={{ flex: 1 }}>
            <Text style={G.textCyber}>REŽIM VYSIELANIA</Text>
            <Text style={{ color: '#666', fontSize: 10 }}>{cardData.isPublic ? 'VEREJNÉ - Vysielam do Matrixu' : 'SÚKROMNÉ - Iba v tomto zariadení'}</Text>
          </View>
          <Switch 
            onValueChange={(val) => setCardData({...cardData, isPublic: val})} 
            value={cardData.isPublic} 
            trackColor={{ false: "#333", true: "#066" }} 
            thumbColor={cardData.isPublic ? "#0FF" : "#666"} 
          />
        </View>

        {/* VEREJNÉ ÚDAJE */}
        <Text style={[G.textCyber, { color: '#0FF' }]}>MENO / NICK (VEREJNÉ)</Text>
        <TextInput style={G.terminalInput} value={cardData.meno} onChangeText={(val) => setCardData({...cardData, meno: val})} placeholder="Meno..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#0FF' }]}>KATEGÓRIA</Text>
        <TouchableOpacity style={[G.terminalInput, { justifyContent: 'center' }]} onPress={() => setShowPicker(true)}>
          <Text style={{ color: '#FFF' }}>{getCategoryLabel(cardData.kategoria)}</Text>
          <Text style={{ color: '#666', position: 'absolute', right: 15 }}>▼</Text>
        </TouchableOpacity>

        <Text style={[G.textCyber, { color: '#0FF' }]}>LOKALITA</Text>
        <TextInput style={G.terminalInput} value={cardData.lok} onChangeText={(val) => setCardData({...cardData, lok: val})} placeholder="Kde..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#0FF' }]}>VÍZIA / POPIS</Text>
        <TextInput style={[G.terminalInput, { height: 70, textAlignVertical: 'top' }]} multiline numberOfLines={3} value={cardData.popis} onChangeText={(val) => setCardData({...cardData, popis: val})} placeholder="Čomu sa venuješ..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#0FF' }]}>GALÉRIA (LINK)</Text>
        <TextInput style={G.terminalInput} value={cardData.gal} onChangeText={(val) => setCardData({...cardData, gal: val})} placeholder="https://..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <View style={G.divider} />

        {/* SÚKROMNÉ ÚDAJE */}
        <Text style={[G.textCyber, { color: '#b19cd9' }]}>SÚKROMNÝ KONTAKT (LEN PRE HANDSHAKE)</Text>
        
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} keyboardType="phone-pad" value={cardData.tel} onChangeText={(val) => setCardData({...cardData, tel: val})} placeholder="Telefón..." placeholderTextColor={G.placeholderColor} />
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} value={cardData.email} onChangeText={(val) => setCardData({...cardData, email: val})} placeholder="E-mail..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} value={cardData.fb} onChangeText={(val) => setCardData({...cardData, fb: val})} placeholder="Facebook..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />
        <TextInput style={G.terminalInput} value={cardData.tg} onChangeText={(val) => setCardData({...cardData, tg: val})} placeholder="Telegram..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <View style={G.divider} />
        
        <Text style={[G.textCyber, { color: '#b19cd9' }]}>FINANCIE (IBA LOKÁL)</Text>
        <TextInput style={[G.terminalInput, { marginBottom: 10 }]} value={cardData.revo} onChangeText={(val) => setCardData({...cardData, revo: val})} placeholder="Revolut @nick" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />
        <TextInput style={G.terminalInput} value={cardData.kRod} onChangeText={(val) => setCardData({...cardData, kRod: val})} placeholder="KorunyROD účet" placeholderTextColor={G.placeholderColor} />

        <TouchableOpacity 
          style={[G.ircButton, { marginTop: 30, borderColor: cardData.isPublic ? '#0FF' : '#F0F', opacity: loading ? 0.5 : 1, marginBottom: 50 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={cardData.isPublic ? '#0FF' : '#F0F'} />
          ) : (
            <Text style={[G.ircButtonText, { color: cardData.isPublic ? '#0FF' : '#F0F' }]}>
              [ {cardData.isPublic ? 'VYSLAŤ PEČAŤ DO MATRIXU' : 'ZAPEČATIŤ SÚKROMNE'} ]
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL PRE KATEGÓRIE */}
      <Modal visible={showPicker} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#333', maxHeight: '80%', borderRadius: 10 }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={G.textCyber}>VÝBER KATEGÓRIE</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ color: '#F0F' }}>[ ZAVRIEŤ ]</Text>
              </TouchableOpacity>
            </View>
            <FlatList 
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' }}
                  onPress={() => {
                    setCardData({ ...cardData, kategoria: item.id }); 
                    setShowPicker(false);
                  }}
                >
                  <Text style={{ color: cardData.kategoria === item.id ? '#0FF' : '#AAA' }}>{item.label}</Text>
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