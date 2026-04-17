import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';

const CardScreen = ({ navigation }) => {
  // Dáta presne podľa tvojho pôvodného vzoru
  const item = {
    id: 1,
    kat: "MASTER CARPENTER",
    meno: "Samuel Hudec - Sammael",
    lok: "Rákoš / Rožňava / Revúca",
    popis: "Rustic, steampunk a avantgardné stolárstvo. Orez ovocných stromov a tvorba svetelných artefaktov.",
    tel: "+421 9xx xxx xxx",
    email: "sammael@laria.sk",
    fb: "https://facebook.com",
    tg: "https://t.me/sammael",
    gal: "https://galeria.laria.sk"
  };

  return (
    <SafeAreaView style={UI.container}>
      <ScrollView contentContainerStyle={UI.scrollContent}>
        
        {/* HLAVNÁ KARTA - tvoj pôvodný vizuál */}
        <View style={UI.card}>
          <Text style={UI.tag}>{item.kat}</Text>
          <Text style={UI.name}>{item.meno}</Text>
          <Text style={UI.loc}>📍 {item.lok}</Text>
          
          <View style={UI.divider} />
          
          <Text style={UI.cat}>{item.popis}</Text>
          
          {/* CARD-ACTIONS-ROW */}
          <View style={UI.actionRow}>
            <TouchableOpacity 
              style={[UI.btnAction, UI.btnPhone]} 
              onPress={() => Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}
            >
              <Text style={UI.btnText}>📞 Volať</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[UI.btnAction, UI.btnShare]} 
              onPress={() => alert('Zdieľanie (NFC/QR) pripravené na prepojenie')}
            >
              <Text style={UI.btnText}>🔗 Zdieľať</Text>
            </TouchableOpacity>

            {item.email && (
              <TouchableOpacity 
                style={[UI.btnAction, UI.btnEmail]} 
                onPress={() => Linking.openURL(`mailto:${item.email}`)}
              >
                <Text style={UI.btnText}>✉️ Email</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* SOCIAL-LINKS */}
          <View style={UI.socialLinks}>
            {item.fb && <Text style={[UI.socialLink, {color: '#1877F2'}]} onPress={() => Linking.openURL(item.fb)}>Facebook</Text>}
            {item.tg && <Text style={[UI.socialLink, {color: '#0088cc'}]} onPress={() => Linking.openURL(item.tg)}>Telegram</Text>}
            {item.gal && <Text style={[UI.socialLink, {color: '#ea4335'}]} onPress={() => Linking.openURL(item.gal)}>🖼️ Galéria</Text>}
          </View>
        </View>

        {/* SPÄŤ TLAČIDLO */}
        <TouchableOpacity style={UI.backButton} onPress={() => navigation.goBack()}>
          <Text style={UI.backText}>[ SPÄŤ DO ATELIÉRU ]</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const UI = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20, alignItems: 'center', paddingTop: 60 },
  card: { 
    backgroundColor: '#111', 
    width: '100%', 
    padding: 25, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#333',
    elevation: 10,
    shadowColor: '#0F0',
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  tag: { color: '#0F0', fontSize: 10, letterSpacing: 2, marginBottom: 10, fontWeight: 'bold' },
  name: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 5, fontFamily: 'monospace' },
  loc: { color: '#888', fontSize: 12, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#222', marginBottom: 20 },
  cat: { color: '#AAA', fontSize: 14, lineHeight: 22, marginBottom: 30, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 10 },
  btnAction: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnPhone: { backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  btnShare: { backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  btnEmail: { backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  btnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  socialLinks: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  socialLink: { fontSize: 12, fontWeight: 'bold', textDecorationLine: 'underline' },
  backButton: { marginTop: 40, padding: 20 },
  backText: { color: '#444', fontSize: 12, letterSpacing: 2, fontFamily: 'monospace' }
});

export default CardScreen;