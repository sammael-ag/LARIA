import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- GLOBÁLNE ŠTÝLY A KONTEXT ---
import { G } from '../styles/styles'; 
import { useLaria } from '../context/LariaContext';

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { contact } = route.params || {};
  const isOwner = !contact;
  
  const [isVerified, setIsVerified] = useState(isOwner || (contact && contact.isVerified));
  const [isPinned, setIsPinned] = useState(contact?.pinned || false);

  const item = isOwner ? {
    kat: "MASTER CARPENTER",
    meno: vault.identity.name,
    lok: "Rákoš / Rožňava / Revúca",
    popis: "Rustic, steampunk a avantgardné stolárstvo. Orez ovocných stromov a tvorba svetelných artefaktov.",
    tel: vault.identity.tel,
    email: vault.identity.email,
    fb: vault.identity.fb,
    tg: vault.identity.tg,
    gal: vault.identity.gal,
    sha: vault.identity.sha
  } : {
    kat: contact.cat?.toUpperCase() || "KONTAKT",
    meno: contact.name,
    lok: contact.loc,
    popis: contact.desc || "Kontakt uložený vo tvojom vizitkári.",
    tel: isVerified ? (contact.tel || "+421 000 000 000") : "ZAMKNUTÉ (Smart Contract)",
    email: isVerified ? (contact.email || "info@laria.sk") : "ZAMKNUTÉ (Smart Contract)",
    fb: contact.fb || null,
    tg: contact.tg || null,
    gal: contact.gal || null,
    sha: contact.id
  };

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.scrollContent}>
        
        {/* HLAVNÁ KARTA */}
        <View style={[
          G.card, 
          isPinned && { borderColor: '#0FF', shadowColor: '#0FF' } // Lokálna úprava pre pripnutý stav
        ]}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={G.tag}>{item.kat}</Text>
            {!isOwner && (
              <TouchableOpacity onPress={() => setIsPinned(!isPinned)} style={{ padding: 5 }}>
                <Text style={{ fontSize: 22 }}>{isPinned ? '📍' : '📌'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', marginBottom: 5 }]}>{item.meno}</Text>
          <Text style={G.textDim}>📍 {item.lok}</Text>
          
          <View style={G.divider} />
          
          <Text style={[G.textMain, { fontStyle: 'italic', lineHeight: 22, marginBottom: 30 }]}>
            {item.popis}
          </Text>
          
          {/* TLAČIDLÁ AKCIÍ */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 10 }}>
            <TouchableOpacity 
              style={[G.btnAction, !isVerified && { opacity: 0.2 }]} 
              disabled={!isVerified}
              onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}
            >
              <Text style={G.btnText}>📞 Volať</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={G.btnAction} 
              onPress={() => Alert.alert('Laria ID', `Unikátny kľúč: ${item.sha || 'MASTER_SOUL'}`)}
            >
              <Text style={G.btnText}>🔗 ID</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[G.btnAction, !isVerified && { opacity: 0.2 }]} 
              disabled={!isVerified}
              onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
            >
              <Text style={G.btnText}>✉️ Email</Text>
            </TouchableOpacity>
          </View>
          
          {/* SOCIÁLNE SIETE */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 }}>
            {item.fb && <Text style={[G.textDim, { fontWeight: 'bold', color: '#1877F2' }]} onPress={() => Linking.openURL(item.fb)}>FB</Text>}
            {item.tg && <Text style={[G.textDim, { fontWeight: 'bold', color: '#0088cc' }]} onPress={() => Linking.openURL(item.tg)}>TG</Text>}
            {item.gal && <Text style={[G.textDim, { fontWeight: 'bold', color: '#ea4335' }]} onPress={() => Linking.openURL(item.gal)}>🖼️ GALÉRIA</Text>}
          </View>
        </View>

        {/* SPODNÁ AKCIA */}
        <View style={{ width: '100%', marginTop: 25 }}>
          {isOwner ? (
            <TouchableOpacity 
              style={{ padding: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F0F', borderRadius: 10 }} 
              onPress={() => navigation.navigate('CardEditor')}
            >
              <Text style={[G.textCyber, { color: '#F0F' }]}>[ UPRAVIŤ MOJU PEČAŤ ]</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[G.ircButton, !isVerified && { borderColor: '#333' }]} 
              onPress={() => navigation.navigate('IRC')}
            >
              <Text style={G.ircButtonText}>
                {isVerified ? 'VSTÚPIŤ DO IRC CHATU' : 'OVERIŤ CEZ SMART CONTRACT'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={{ marginTop: 40, padding: 10, alignItems: 'center' }} onPress={() => navigation.goBack()}>
          <Text style={[G.textDim, { letterSpacing: 3 }]}>[ NÁVRAT DO SYSTÉMU ]</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;