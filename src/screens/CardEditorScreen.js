import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; // Naše globálne centrum krásy
import { fetchGMatrix } from '../services/GMatrixService'; 

const CardEditorScreen = ({ navigation }) => {
  // Lokálny stav so všetkými poliami vizitky pre majstra
  const [cardData, setCardData] = useState({
    kat: 'MASTER CARPENTER',
    meno: 'Samuel Hudec - Sammael',
    lok: 'Rákoš / Rožňava / Revúca',
    popis: 'Rustic, steampunk a avantgardné stolárstvo. Orez ovocných stromov a tvorba svetelných artefaktov.',
    tel: '+421 951 815 453',
    email: 'sammael.ag@gmail.com',
    fb: 'https://www.facebook.com/JEDINECNY.POVRCH.DREVA',
    tg: 'https://t.me/Sammael777',
    gal: 'https://photos.app.goo.gl/pqbaoq7d7g7HkTix8',
    isPublic: false // Náš prepínač: Súkromie (false) vs Kyslík/Web (true) 
  });

  const handleSave = () => {
    // Tu sa neskôr v LARIA ENGINE udeje tá krypto-mágia a zápis do tabuľky 
    const rezim = cardData.isPublic ? "VEREJNÝ (Kód s kyslíkom)" : "SÚKROMNÝ (Zatvorené dvere)";
    Alert.alert("Pečať vytesaná", `Tvoja digitálna identita bola úspešne aktualizovaná v režime: ${rezim}.`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HEADER - s indikátorom režimu podľa farby */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ZRUŠIŤ ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>TESANIE IDENTITY</Text>
          <View style={{ 
            width: 8, 
            height: 8, 
            backgroundColor: cardData.isPublic ? '#0FF' : '#F0F', 
            borderRadius: 4 
          }} />
        </View>

        {/* PRÍSTUPOVÝ REŽIM - "ŠATY PRE KÓD" */}
        <View style={{ 
          backgroundColor: '#111', 
          padding: 15, 
          borderRadius: 5, 
          marginBottom: 20, 
          borderLeftWidth: 3, 
          borderLeftColor: cardData.isPublic ? '#0FF' : '#F0F' 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[G.textCyber, { marginBottom: 0 }]}>REŽIM SÚKROMIA</Text>
              <Text style={{ color: '#666', fontSize: 10 }}>
                {cardData.isPublic ? 'VEREJNÉ - Viditeľné na webe' : 'SÚKROMNÉ - Iba cez NFC/QR v appke'}
              </Text>
            </View>
            <Switch 
              trackColor={{ false: "#333", true: "#055" }}
              thumbColor={cardData.isPublic ? "#0FF" : "#999"}
              onValueChange={(val) => setCardData({...cardData, isPublic: val})}
              value={cardData.isPublic}
            />
          </View>
        </View>

        {/* --- EDITOR POLÍ --- */}
        
        <Text style={G.textCyber}>KATEGÓRIA (TAG)</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.kat}
          onChangeText={(val) => setCardData({...cardData, kat: val.toUpperCase()})}
          placeholder="Napr. MASTER CARPENTER"
          placeholderTextColor={G.placeholderColor}
        />

        <Text style={G.textCyber}>MENO A TITUL</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.meno}
          onChangeText={(val) => setCardData({...cardData, meno: val})}
          placeholder="Tvoje meno"
          placeholderTextColor={G.placeholderColor}
        />

        <Text style={G.textCyber}>PÔSOBISKO (LOKALITY)</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.lok}
          onChangeText={(val) => setCardData({...cardData, lok: val})}
          placeholder="Okresy / Mestá"
          placeholderTextColor={G.placeholderColor}
        />

        <Text style={G.textCyber}>VÍZIA A POPIS PRÁCE</Text>
        <TextInput 
          style={[G.terminalInput, { height: 100, textAlignVertical: 'top' }]}
          multiline
          numberOfLines={4}
          value={cardData.popis}
          onChangeText={(val) => setCardData({...cardData, popis: val})}
          placeholder="Čo tvoríš?"
          placeholderTextColor={G.placeholderColor}
        />

        <View style={G.divider} />

        <Text style={G.textCyber}>TELEFÓN</Text>
        <TextInput 
          style={G.terminalInput}
          keyboardType="phone-pad"
          value={cardData.tel}
          onChangeText={(val) => setCardData({...cardData, tel: val})}
          placeholder="+421..."
          placeholderTextColor={G.placeholderColor}
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
        />

        <Text style={G.textCyber}>TELEGRAM (URL/NICK)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.tg}
          onChangeText={(val) => setCardData({...cardData, tg: val})}
          placeholder="https://t.me/..."
          placeholderTextColor={G.placeholderColor}
        />

        <Text style={G.textCyber}>G-ALBUM (LINK NA PORTFÓLIO)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.gal}
          onChangeText={(val) => setCardData({...cardData, gal: val})}
          placeholder="Link na tvoje fotky"
          placeholderTextColor={G.placeholderColor}
        />

        {/* ULOŽENIE - Tlačidlo mení štýl podľa režimu súkromia */}
        <TouchableOpacity 
          style={[G.ircButton, { 
            marginTop: 30, 
            borderColor: cardData.isPublic ? '#0FF' : '#F0F' 
          }]} 
          onPress={handleSave}
        >
          <Text style={[G.ircButtonText, { color: cardData.isPublic ? '#0FF' : '#F0F' }]}>
            [ {cardData.isPublic ? 'VYSIELAŤ DO SVETA' : 'ZAPEČATIŤ V SÚKROMÍ'} ]
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardEditorScreen;