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

const CardEditorScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Lokálny stav so VŠETKÝMI poliami (už aj s tel)
  const [cardData, setCardData] = useState({
    sha: 'LARIA-SAMMAEL-777', 
    kat: 'MASTER CARPENTER',
    meno: 'Samuel Hudec - Sammael',
    lok: 'Rákoš / Rožňava / Revúca',
    popis: 'Rustic, steampunk a avantgardné stolárstvo. Orez ovocných stromov a tvorba svetelných artefaktov.',
    tel: '+421 951 815 453', // TUTO JE!
    email: 'sammael.ag@gmail.com',
    fb: 'https://www.facebook.com/JEDINECNY.POVRCH.DREVA',
    tg: 'https://t.me/Sammael777',
    gal: 'https://photos.app.goo.gl/pqbaoq7d7g7HkTix8',
    irc: '', 
    poznamka: 'Uložené cez LARIA App',
    isPublic: false 
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Príprava balíka pre bota
      const dataPreBot = {
        sha: cardData.sha,
        meno: cardData.meno,
        kategoria: cardData.kat,
        lokalita: cardData.lok,
        popis: cardData.popis,
        tel: cardData.tel,   // Pridané do balíka
        email: cardData.email,
        fb: cardData.fb,
        tg: cardData.tg,
        gal: cardData.gal,
        isPublic: cardData.isPublic,
        irc: cardData.irc,
        poznamka: cardData.poznamka
      };

      const result = await saveToGMatrix(dataPreBot);

      if (result && result.success) {
        Alert.alert("Pečať vytesaná", "Tvoja identita bola úspešne odoslaná do Matrixu.");
        navigation.goBack();
      } else {
        throw new Error("Bot neodpovedá správne");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Chyba spojenia", "Nepodarilo sa nadviazať kontakt s Matrixom.");
    } finally {
      setLoading(false);
    }
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
          <View style={{ 
            width: 8, 
            height: 8, 
            backgroundColor: cardData.isPublic ? '#0FF' : '#F0F', 
            borderRadius: 4 
          }} />
        </View>

        {/* REŽIM SÚKROMIA */}
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
                {cardData.isPublic ? 'VEREJNÉ - Vysielanie na web' : 'SÚKROMNÉ - Iba lokálne'}
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
        />

        <Text style={G.textCyber}>MENO A TITUL</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.meno}
          onChangeText={(val) => setCardData({...cardData, meno: val})}
        />

        <Text style={G.textCyber}>PÔSOBISKO (LOKALITY)</Text>
        <TextInput 
          style={G.terminalInput}
          value={cardData.lok}
          onChangeText={(val) => setCardData({...cardData, lok: val})}
        />

        <Text style={G.textCyber}>VÍZIA A POPIS PRÁCE</Text>
        <TextInput 
          style={[G.terminalInput, { height: 100, textAlignVertical: 'top' }]}
          multiline
          numberOfLines={4}
          value={cardData.popis}
          onChangeText={(val) => setCardData({...cardData, popis: val})}
        />

        <View style={G.divider} />

        <Text style={G.textCyber}>TELEFÓN</Text>
        <TextInput 
          style={G.terminalInput}
          keyboardType="phone-pad"
          value={cardData.tel}
          onChangeText={(val) => setCardData({...cardData, tel: val})}
          placeholder="+421..."
          placeholderTextColor="#444"
        />

        <Text style={G.textCyber}>E-MAIL</Text>
        <TextInput 
          style={G.terminalInput}
          keyboardType="email-address"
          autoCapitalize="none"
          value={cardData.email}
          onChangeText={(val) => setCardData({...cardData, email: val})}
        />

        <Text style={G.textCyber}>FACEBOOK (LINK)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.fb}
          onChangeText={(val) => setCardData({...cardData, fb: val})}
        />

        <Text style={G.textCyber}>TELEGRAM (URL/NICK)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.tg}
          onChangeText={(val) => setCardData({...cardData, tg: val})}
        />

        <Text style={G.textCyber}>G-ALBUM (PORTFÓLIO)</Text>
        <TextInput 
          style={G.terminalInput}
          autoCapitalize="none"
          value={cardData.gal}
          onChangeText={(val) => setCardData({...cardData, gal: val})}
        />

        {/* TLAČIDLO ULOŽENIA */}
        <TouchableOpacity 
          style={[G.ircButton, { 
            marginTop: 30, 
            borderColor: cardData.isPublic ? '#0FF' : '#F0F',
            opacity: loading ? 0.5 : 1
          }]} 
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