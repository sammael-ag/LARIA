import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';

const CardScreen = ({ route, navigation }) => {
  // 1. LOGIKA: Zistíme, či pozeráme na seba alebo na niekoho iného
  const { contact } = route.params || {};
  const isOwner = !contact;

  // 2. DÁTA: Tvoje fixné údaje alebo údaje z vybraného kontaktu
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
    <SafeAreaView style={UI.container}>
      <ScrollView contentContainerStyle={UI.scrollContent}>
        
        {/* TVOJA HLAVNÁ KARTA */}
        <View style={UI.card}>
          <Text style={UI.tag}>{item.kat}</Text>
          <Text style={UI.name}>{item.meno}</Text>
          <Text style={UI.loc}>📍 {item.lok}</Text>
          
          <View style={UI.divider} />
          
          <Text style={UI.cat}>{item.popis}</Text>
          
          {/* KONTAKTNÉ TLAČIDLÁ - vždy viditeľné */}
          <View style={UI.actionRow}>
            <TouchableOpacity 
              style={[UI.btnAction, UI.btnPhone]} 
              onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}
            >
              <Text style={UI.btnText}>📞 Volať</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[UI.btnAction, UI.btnShare]} 
              onPress={() => alert('Zdieľanie vizitky pripravené')}
            >
              <Text style={UI.btnText}>🔗 Zdieľať</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[UI.btnAction, UI.btnEmail]} 
              onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
            >
              <Text style={UI.btnText}>✉️ Email</Text>
            </TouchableOpacity>
          </View>
          
          {/* SOCIÁLNE SIETE - viditeľné vždy, keď sú v dátach */}
          <View style={UI.socialLinks}>
            {item.fb && <Text style={[UI.socialLink, {color: '#1877F2'}]} onPress={() => Linking.openURL(item.fb)}>Facebook</Text>}
            {item.tg && <Text style={[UI.socialLink, {color: '#0088cc'}]} onPress={() => Linking.openURL(item.tg)}>Telegram</Text>}
            {item.gal && <Text style={[UI.socialLink, {color: '#ea4335'}]} onPress={() => Linking.openURL(item.gal)}>🖼️ Galéria</Text>}
          </View>
        </View>

        {/* LOGICKÉ TLAČIDLÁ POD KARTOU */}
        <View style={UI.bottomActions}>
          {isOwner ? (
            <TouchableOpacity style={UI.editButton} onPress={() => alert('Režim úpravy identity')}>
              <Text style={UI.editButtonText}>[ UPRAVIŤ MOJU PEČAŤ ]</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={UI.ircButton} 
              onPress={() => navigation.navigate('IRC')}
            >
              <Text style={UI.ircButtonText}>NADVIAZAŤ IRC SPOJENIE</Text>
            </TouchableOpacity>
          )}
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
  btnAction: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  btnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  socialLinks: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  socialLink: { fontSize: 12, fontWeight: 'bold', textDecorationLine: 'underline' },
  bottomActions: { width: '100%', marginTop: 25 },
  editButton: { padding: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 10 },
  editButtonText: { color: '#444', fontFamily: 'monospace', fontSize: 12 },
  ircButton: { backgroundColor: '#0F0', padding: 18, borderRadius: 12, alignItems: 'center' },
  ircButtonText: { color: '#000', fontWeight: 'bold', letterSpacing: 1, fontSize: 14, fontFamily: 'monospace' },
  backButton: { marginTop: 30, padding: 20 },
  backText: { color: '#444', fontSize: 12, letterSpacing: 2, fontFamily: 'monospace' }
});

export default CardScreen;