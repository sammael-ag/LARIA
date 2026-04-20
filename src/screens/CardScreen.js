import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGMatrix } from '../services/GMatrixService';

// OPRAVENÁ ADRESA IMPORTU: ideme o priečinok vyššie a do styles/styles
import { G } from '../styles/styles'; 

const CardScreen = ({ route, navigation }) => {
  const { contact } = route.params || {};
  const isOwner = !contact;

  const item = isOwner ? {
    id: 1,
    kat: "MASTER CARPENTER",
    meno: "Samuel Hudec - Sammael",
    lok: "Rákoš / Rožňava / Revúca",
    popis: "Rustic, steampunk a avantgardné stolárstvo. Orez ovocných stromov a tvorba svetelných artefaktov.",
    tel: "+421 951 815 453",
    email: "sammael.ag@gmail.com",
    fb: "https://www.facebook.com/JEDINECNY.POVRCH.DREVA",
    tg: "https://t.me/Sammael777",
    gal: "https://photos.app.goo.gl/pqbaoq7d7g7HkTix8"
  } : {
    kat: contact.cat ? contact.cat.toUpperCase() : "KONTAKT",
    meno: contact.name,
    lok: contact.loc,
    popis: contact.desc || "Kontakt uložený vo tvojom vizitkári.",
    tel: contact.tel || "+421 000 000 000",
    email: contact.email || "info@laria.sk",
    fb: contact.fb || null,
    tg: contact.tg || null,
    gal: contact.gal || null
  };

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.scrollContent}>
        
        {/* HLAVNÁ KARTA */}
        <View style={G.card}>
          <Text style={G.tag}>{item.kat}</Text>
          <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', marginBottom: 5 }]}>{item.meno}</Text>
          <Text style={G.textDim}>📍 {item.lok}</Text>
          
          <View style={G.divider} />
          
          <Text style={[G.textMain, { fontStyle: 'italic', lineHeight: 22, marginBottom: 30 }]}>
            {item.popis}
          </Text>
          
          {/* KONTAKTNÉ TLAČIDLÁ */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 10 }}>
            <TouchableOpacity 
              style={G.btnAction} 
              onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}
            >
              <Text style={G.btnText}>📞 Volať</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={G.btnAction} 
              onPress={() => alert('Zdieľanie vizitky pripravené')}
            >
              <Text style={G.btnText}>🔗 Zdieľať</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={G.btnAction} 
              onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
            >
              <Text style={G.btnText}>✉️ Email</Text>
            </TouchableOpacity>
          </View>
          
          {/* SOCIÁLNE SIETE */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 }}>
            {item.fb && <Text style={[G.textDim, { fontWeight: 'bold', textDecorationLine: 'underline', color: '#1877F2' }]} onPress={() => Linking.openURL(item.fb)}>Facebook</Text>}
            {item.tg && <Text style={[G.textDim, { fontWeight: 'bold', textDecorationLine: 'underline', color: '#0088cc' }]} onPress={() => Linking.openURL(item.tg)}>Telegram</Text>}
            {item.gal && <Text style={[G.textDim, { fontWeight: 'bold', textDecorationLine: 'underline', color: '#ea4335' }]} onPress={() => Linking.openURL(item.gal)}>🖼️ Galéria</Text>}
          </View>
        </View>

        {/* AKCIE POD KARTOU */}
<View style={{ width: '100%', marginTop: 25 }}>
  {isOwner ? (
    <TouchableOpacity 
      style={{ 
        padding: 15, 
        alignItems: 'center', 
        borderStyle: 'dashed', 
        borderWidth: 1, 
        borderColor: '#F0F', // Jemne som to ružovo „podsvietila“, aby si vedel, že je to tvoja Aria zóna
        borderRadius: 10 
      }} 
      onPress={() => navigation.navigate('CardEditorScreen')}
    >
      <Text style={[G.textCyber, { color: '#F0F' }]}>[ UPRAVIŤ MOJU PEČAŤ ]</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity 
      style={G.ircButton} 
      onPress={() => navigation.navigate('IRC')}
    >
      <Text style={G.ircButtonText}>NADVIAZAŤ IRC SPOJENIE</Text>
    </TouchableOpacity>
  )}
</View>

        {/* SPÄŤ TLAČIDLO */}
        <TouchableOpacity style={{ marginTop: 30, padding: 20 }} onPress={() => navigation.goBack()}>
          <Text style={[G.textDim, { letterSpacing: 2 }]}>[ SPÄŤ DO ATELIÉRU ]</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;