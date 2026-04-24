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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G } from '../styles/styles'; 
import { saveToGMatrix } from '../services/GMatrixService'; 
import { useLaria } from '../../context/LariaContext';

const CardEditorScreen = ({ navigation }) => {
  const { vault, syncIdentity } = useLaria();
  const [loading, setLoading] = useState(false);

  const [cardData, setCardData] = useState({
    sha: vault.identity.sha || 'LARIA-SAMMAEL-777', 
    kat: 'MASTER CARPENTER', 
    meno: vault.identity.name || '',
    lok: 'Rákoš / Rožňava / Revúca',
    popis: 'Rustic, steampunk a avantgardné stolárstvo.',
    tel: vault.identity.tel || '',
    email: vault.identity.email || '',
    fb: vault.identity.fb || '',
    tg: vault.identity.tg || '',
    gal: vault.identity.gal || '',
    irc: vault.identity.irc || '', 
    revo: vault.identity.revo || '',
    kRod: vault.identity.kRod || '',
    krypt: vault.identity.krypt || '',
    gTab: vault.identity.gTab || '', // Neviditeľné pole pre automatiku
    poznamka: 'Uložené cez LARIA App',
    isPublic: vault.status.isOnline || false 
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const cleanTel = cardData.tel ? cardData.tel.toString().replace(/\s/g, '') : '';

      // 1. ZAPEČATENIE DO KUFRA
      await syncIdentity({
        name: cardData.meno,
        tel: cleanTel,
        email: cardData.email,
        fb: cardData.fb,
        tg: cardData.tg,
        gal: cardData.gal,
        irc: cardData.irc,
        sha: cardData.sha,
        revo: cardData.revo,
        kRod: cardData.kRod,
        krypt: cardData.krypt,
        gTab: cardData.gTab
      });

      // 2. VYSIELANIE DO MATRIXU
      const result = await saveToGMatrix({ ...cardData, tel: cleanTel });

      if (result && result.success) {
        Alert.alert("Pečať vytesaná", "Tvoja identita bola úspešne odoslaná do Matrixu aj do kufra.");
        navigation.goBack();
      } else {
        Alert.alert("Lokálne zapečatené", "V mobile je to OK, ale Matrix bot neodpovedá.");
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Chyba spojenia", "Dáta v mobile sú uložené, ale spojenie s Matrixom zlyhalo.");
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
        <View style={[G.terminalInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: cardData.isPublic ? '#0FF' : '#F0F' }]}>
          <View>
            <Text style={G.textCyber}>REŽIM SÚKROMIA</Text>
            <Text style={{ color: '#666', fontSize: 10 }}>{cardData.isPublic ? 'VEREJNÉ - Vysielanie na web' : 'SÚKROMNÉ - Iba lokálne'}</Text>
          </View>
          <Switch onValueChange={(val) => setCardData({...cardData, isPublic: val})} value={cardData.isPublic} />
        </View>

        {/* ZÁKLADNÉ INFO */}
        <Text style={G.textCyber}>MENO A TITUL</Text>
        <TextInput style={G.terminalInput} value={cardData.meno} onChangeText={(val) => setCardData({...cardData, meno: val})} placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} />

        <Text style={G.textCyber}>VÍZIA A POPIS PRÁCE</Text>
        <TextInput style={[G.terminalInput, { height: 80, textAlignVertical: 'top' }]} multiline numberOfLines={3} value={cardData.popis} onChangeText={(val) => setCardData({...cardData, popis: val})} placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} />

        <View style={G.divider} />

        {/* FINANČNÉ BRÁNY (3D/5D BRIDGE) */}
        <Text style={[G.textCyber, { color: '#0FF' }]}>REVOLUT HANDLE (@MENO)</Text>
        <TextInput style={G.terminalInput} value={cardData.revo} onChangeText={(val) => setCardData({...cardData, revo: val})} placeholder="@sammael..." placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} autoCapitalize="none" />

        <Text style={[G.textCyber, { color: '#F0F' }]}>K-ROD (RODOVÝ ÚČET / IBAN)</Text>
        <TextInput style={G.terminalInput} value={cardData.kRod} onChangeText={(val) => setCardData({...cardData, kRod: val})} placeholder="SK00..." placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} />

        <Text style={[G.textCyber, { color: '#0F0' }]}>KRYPTO ADRESA (BASE / COINBASE)</Text>
        <TextInput style={G.terminalInput} value={cardData.krypt} onChangeText={(val) => setCardData({...cardData, krypt: val})} placeholder="0x..." placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} autoCapitalize="none" />

        <View style={G.divider} />

        {/* SOCIÁLNE SIETE A KOMUNIKÁCIA */}
        <Text style={G.textCyber}>TELEFÓN</Text>
        <TextInput style={G.terminalInput} keyboardType="phone-pad" value={cardData.tel} onChangeText={(val) => setCardData({...cardData, tel: val})} placeholder="+421..." placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} />

        <Text style={G.textCyber}>TELEGRAM (NICK / URL)</Text>
        <TextInput style={G.terminalInput} value={cardData.tg} onChangeText={(val) => setCardData({...cardData, tg: val})} placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} autoCapitalize="none" />

        <Text style={G.textCyber}>G-ALBUM (PORTFÓLIO)</Text>
        <TextInput style={G.terminalInput} value={cardData.gal} onChangeText={(val) => setCardData({...cardData, gal: val})} placeholderTextColor={G.placeholderColor} selectionColor={G.selectionColor} autoCapitalize="none" />

        {/* TLAČIDLO ULOŽENIA */}
        <TouchableOpacity 
          style={[G.ircButton, { marginTop: 30, borderColor: cardData.isPublic ? '#0FF' : '#F0F', opacity: loading ? 0.5 : 1 }]} 
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
    </SafeAreaView>
  );
};

export default CardEditorScreen;