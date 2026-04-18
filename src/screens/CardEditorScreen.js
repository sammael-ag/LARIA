import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; 

const CardEditorScreen = ({ navigation }) => {
  // Lokálny stav presne podľa polí v CardScreen 
  const [cardData, setCardData] = useState({
    kat: 'MASTER CARPENTER',
    meno: 'Samuel Hudec - Sammael',
    lok: 'Rákoš / Rožňava / Revúca',
    popis: 'Rustic, steampunk a avantgardné stolárstvo. Orez ovocných stromov a tvorba svetelných artefaktov.',
    tel: '+421 951 815 453',
    email: 'sammael.ag@gmail.com',
    fb: 'https://www.facebook.com/JEDINECNY.POVRCH.DREVA',
    tg: 'https://t.me/Sammael777',
    gal: 'https://photos.app.goo.gl/pqbaoq7d7g7HkTix8'
  });

  const handleSave = () => {
    // Tu sa neskôr napojí ukladanie do krypto-peňaženky alebo úložiska
    Alert.alert("Pečať vytesaná", "Tvoja digitálna identita bola úspešne aktualizovaná.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HEADER */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ZRUŠIŤ ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>TESANIE IDENTITY</Text>
          <View style={{ width: 8, height: 8, backgroundColor: '#F0F', borderRadius: 4 }} />
        </View>

        {/* KATEGÓRIA / ZAMERANIE */}
        <Text style={G.textCyber}>KATEGÓRIA (TAG)</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.kat}
          onChangeText={(val) => setCardData({...cardData, kat: val.toUpperCase()})}
          placeholder="Napr. MASTER CARPENTER"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        {/* MENO */}
        <Text style={G.textCyber}>MENO A TITUL</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.meno}
          onChangeText={(val) => setCardData({...cardData, meno: val})}
          placeholder="Tvoje meno"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        {/* LOKALITY */}
        <Text style={G.textCyber}>PÔSOBISKO (LOKALITY)</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.lok}
          onChangeText={(val) => setCardData({...cardData, lok: val})}
          placeholder="Okresy / Mestá"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        {/* POPIS PRÁCE */}
        <Text style={G.textCyber}>VÍZIA A POPIS</Text>
        <TextInput 
          style={[G.terminalInput, { height: 100, textAlignVertical: 'top' }]}
          multiline
          numberOfLines={4}
          value={cardData.popis}
          onChangeText={(val) => setCardData({...cardData, popis: val})}
          placeholder="Čo tvoríš?"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        <View style={G.divider} />

        {/* KONTAKTY */}
        <Text style={G.textCyber}>TELEFÓN</Text>
        <TextInput 
          style={G.terminalInput}
          keyboardType="phone-pad"
          value={cardData.tel}
          onChangeText={(val) => setCardData({...cardData, tel: val})}
          placeholder="+421..."
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        <Text style={G.textCyber}>E-MAIL</Text>
        <TextInput 
          style={G.terminalInput}
          keyboardType="email-address"
          autoCapitalize="none"
          value={cardData.email}
          onChangeText={(val) => setCardData({...cardData, email: val})}
          placeholder="tvoj@email.com"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        <Text style={G.textCyber}>TELEGRAM (NICK)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.tg}
          onChangeText={(val) => setCardData({...cardData, tg: val})}
          placeholder="https://t.me/..."
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        <Text style={G.textCyber}>FACEBOOK (URL)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.fb}
          onChangeText={(val) => setCardData({...cardData, fb: val})}
          placeholder="Odkaz na profil/stránku"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        <Text style={G.textCyber}>G-ALBUM (PORTFÓLIO)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.gal}
          onChangeText={(val) => setCardData({...cardData, gal: val})}
          placeholder="Odkaz na tvoje diela"
          placeholderTextColor={G.placeholderColor}
          selectionColor={G.selectionColor}
        />

        {/* ULOŽENIE */}
        <TouchableOpacity 
          style={G.ircButton} 
          onPress={handleSave}
        >
          <Text style={G.ircButtonText}>[ ZAPEČATIŤ IDENTITU ]</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardEditorScreen;