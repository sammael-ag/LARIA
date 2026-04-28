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
  Clipboard,
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
  // Integrujeme našu novú jahôdku 'ensureLariaIdentity'
  const { vault, syncIdentity, ensureLariaIdentity } = useLaria();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [cardData, setCardData] = useState({
    sha: vault.identity.sha, 
    kategoria: vault.identity.kategoria || 'remesla', 
    meno: vault.identity.name || '',
    lok: vault.identity.lok || 'Rákoš / Rožňava / Revúca',
    popis: vault.identity.popis || 'Rustic, steampunk a avantgardné stolárstvo.',
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

  const copyToClipboard = () => {
    if (cardData.sha) {
      Clipboard.setString(cardData.sha);
      Alert.alert("Pečať skopírovaná", "Tvoj unikátny podpis bol uložený do schránky.");
    }
  };

  const handleSave = async () => {
    if (!cardData.sha) {
      Alert.alert("Chyba identity", "Chýba bezpečná pečať (SHA).");
      return;
    }

    setLoading(true);
    try {
      // --- 🍫 KRYPTO ZROD (Neviditeľný proces) ---
      // Ak užívateľ ešte nemá peňaženku, vytvoríme ju pred odoslaním do Matrixu
      const currentWalletAddress = await ensureLariaIdentity();
      
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      // 1. ZAPEČATENIE LOKÁLNEHO TREZORU
      const updatedIdentity = {
        ...vault.identity,
        name: cardData.meno,
        kategoria: cardData.kategoria,
        lok: cardData.lok,
        popis: cardData.popis,
        tel: cleanTel,
        email: cardData.email,
        fb: cardData.fb,
        tg: cardData.tg,
        gal: cardData.gal,
        revo: cardData.revo,
        kRod: cardData.kRod,
        // Ak sa vygenerovala nová adresa, prioritne použijeme tú
        walletAddress: currentWalletAddress || vault.identity.walletAddress,
        krypt: currentWalletAddress || cardData.krypt,
        isPublic: cardData.isPublic
      };

      await syncIdentity(updatedIdentity);

      // 2. VYSIELANIE DO MATRIXU (Pre Vrátnika Gtab)
      const matrixData = { 
        ...cardData, 
        tel: cleanTel, 
        krypt: currentWalletAddress || cardData.krypt 
      };
      
      const result = await saveToGMatrix(matrixData);

      if (result && result.success) {
        Alert.alert("Pečať vytesaná", "Tvoja identita a peňaženka boli úspešne prepojené.");
        navigation.goBack();
      } else {
        Alert.alert("Lokálne zapečatené", "V mobile uložené, Vrátnik spracuje dáta neskôr.");
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Chyba spojenia", "Proces tesania identity zlyhal.");
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

        {/* SHA SIGNATURE DISPLAY */}
        <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.7} style={{ marginBottom: 25, padding: 12, backgroundColor: '#050505', borderRadius: 5, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[G.textDim, { fontSize: 9, letterSpacing: 1 }]}>AKTÍVNY DIGITÁLNY PODPIS (SHA)</Text>
            <Text style={{ color: '#0FF', fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}>{cardData.sha || 'Generujem pečať...'}</Text>
            <Text style={{ color: '#444', fontSize: 8, marginTop: 4 }}>[ KLIKNI PRE KOPÍROVANIE ]</Text>
          </View>
          <Text style={{ color: '#0FF', fontSize: 18 }}>📋</Text>
        </TouchableOpacity>

        {/* REŽIM SÚKROMIA */}
        <View style={[G.terminalInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: cardData.isPublic ? '#0FF' : '#F0F', marginBottom: 25 }]}>
          <View>
            <Text style={G.textCyber}>REŽIM SÚKROMIA</Text>
            <Text style={{ color: '#666', fontSize: 10 }}>{cardData.isPublic ? 'VEREJNÉ - Vizitka bude na webe' : 'SÚKROMNÉ - Len v tvojom mobile'}</Text>
          </View>
          <Switch onValueChange={(val) => setCardData({...cardData, isPublic: val})} value={cardData.isPublic} trackColor={{ false: "#333", true: "#066" }} thumbColor={cardData.isPublic ? "#0FF" : "#666"} />
        </View>

        {/* FORMULÁR */}
        <Text style={G.textCyber}>MENO / NICK</Text>
        <TextInput style={G.terminalInput} value={cardData.meno} onChangeText={(val) => setCardData({...cardData, meno: val})} placeholder="Tvoje meno..." placeholderTextColor={G.placeholderColor} />

        <Text style={G.textCyber}>HLAVNÁ KATEGÓRIA</Text>
        <TouchableOpacity 
          style={[G.terminalInput, { justifyContent: 'center' }]} 
          onPress={() => setShowPicker(true)}
        >
          <Text style={{ color: '#FFF' }}>{getCategoryLabel(cardData.kategoria)}</Text>
          <Text style={{ color: '#666', position: 'absolute', right: 15 }}>▼</Text>
        </TouchableOpacity>

        <Text style={G.textCyber}>LOKALITA PÔSOBENIA</Text>
        <TextInput style={G.terminalInput} value={cardData.lok} onChangeText={(val) => setCardData({...cardData, lok: val})} placeholder="Napr. Rákoš / Rožňava" placeholderTextColor={G.placeholderColor} />

        <Text style={G.textCyber}>VÍZIA A POPIS PRÁCE</Text>
        <TextInput style={[G.terminalInput, { height: 80, textAlignVertical: 'top' }]} multiline numberOfLines={3} value={cardData.popis} onChangeText={(val) => setCardData({...cardData, popis: val})} placeholder="Čomu sa venuješ..." placeholderTextColor={G.placeholderColor} />

        <View style={G.divider} />

        <Text style={[G.textCyber, { color: '#0FF' }]}>REVOLUT HANDLE</Text>
        <TextInput style={G.terminalInput} value={cardData.revo} onChangeText={(val) => setCardData({...cardData, revo: val})} placeholder="@meno" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <Text style={[G.textCyber, { color: '#F0F' }]}>K-ROD (IBAN)</Text>
        <TextInput style={G.terminalInput} value={cardData.kRod} onChangeText={(val) => setCardData({...cardData, kRod: val})} placeholder="SK00..." placeholderTextColor={G.placeholderColor} />

        <Text style={[G.textCyber, { color: '#0F0' }]}>KRYPTO ADRESA (BASE)</Text>
        <TextInput style={G.terminalInput} value={cardData.krypt} onChangeText={(val) => setCardData({...cardData, krypt: val})} placeholder="0x..." placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <View style={G.divider} />

        <Text style={G.textCyber}>TELEFÓN</Text>
        <TextInput style={G.terminalInput} keyboardType="phone-pad" value={cardData.tel} onChangeText={(val) => setCardData({...cardData, tel: val})} placeholder="+421..." placeholderTextColor={G.placeholderColor} />

        <Text style={G.textCyber}>E-MAIL</Text>
        <TextInput style={G.terminalInput} keyboardType="email-address" value={cardData.email} onChangeText={(val) => setCardData({...cardData, email: val})} placeholder="tvoj@email.com" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <Text style={G.textCyber}>FACEBOOK</Text>
        <TextInput style={G.terminalInput} value={cardData.fb} onChangeText={(val) => setCardData({...cardData, fb: val})} placeholder="fb.com/tvoj.profil" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <Text style={G.textCyber}>TELEGRAM</Text>
        <TextInput style={G.terminalInput} value={cardData.tg} onChangeText={(val) => setCardData({...cardData, tg: val})} placeholder="Nick / URL" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <Text style={G.textCyber}>G-ALBUM URL</Text>
        <TextInput style={G.terminalInput} value={cardData.gal} onChangeText={(val) => setCardData({...cardData, gal: val})} placeholder="Link na portfólio" placeholderTextColor={G.placeholderColor} autoCapitalize="none" />

        <TouchableOpacity 
          style={[G.ircButton, { marginTop: 30, borderColor: cardData.isPublic ? '#0FF' : '#F0F', opacity: loading ? 0.5 : 1, marginBottom: 50 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={cardData.isPublic ? '#0FF' : '#F0F'} />
          ) : (
            <Text style={[G.ircButtonText, { color: cardData.isPublic ? '#0FF' : '#F0F' }]}>
              [ {cardData.isPublic ? 'VYSIELAŤ DO MATRIXU' : 'ZAPEČATIŤ IDENTITU'} ]
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL PICKER PRE KATEGÓRIE */}
      <Modal visible={showPicker} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#333', maxHeight: '80%', borderRadius: 10 }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={G.textCyber}>VYBER KATEGÓRIU</Text>
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