import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, Image } from 'react-native'; // Pridané Image
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; // Naša nová súčiastka

// --- GLOBÁLNE ŠTÝLY A KONTEXT ---
import { G } from '../styles/styles'; 
import { useLaria } from '../../context/LariaContext';

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { contact } = route.params || {};
  const isOwner = !contact;
  
  // Stav pre zobrazenie QR kódu
  const [showQR, setShowQR] = useState(false);
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
    sha: vault.identity.sha,
    wallet: vault.identity.walletAddress // Dôležité pre QR
  } : {
    // ... (zvyšok tvojho itemu pre kontakt ostáva)
    sha: contact.id
  };

  // Dáta, ktoré ponesie QR kód (podľa tvojho algoritmu z cigy)
  const qrValue = JSON.stringify({
    n: item.meno,
    a: item.wallet || item.sha,
    v: "7.9.2"
  });

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.scrollContent}>
        
        {/* HLAVNÁ KARTA - tvoj pôvodný kód... */}
        <View style={[G.card, isPinned && { borderColor: '#0FF', shadowColor: '#0FF' }]}>
           {/* ... (vnútro karty ostáva nezmenené) ... */}
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
          <Text style={[G.textMain, { fontStyle: 'italic', lineHeight: 22, marginBottom: 30 }]}>{item.popis}</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 10 }}>
            <TouchableOpacity style={[G.btnAction, !isVerified && { opacity: 0.2 }]} disabled={!isVerified} onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}>
              <Text style={G.btnText}>📞 Volať</Text>
            </TouchableOpacity>
            <TouchableOpacity style={G.btnAction} onPress={() => Alert.alert('Laria ID', `Unikátny kľúč: ${item.sha || 'MASTER_SOUL'}`)}>
              <Text style={G.btnText}>🔗 ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[G.btnAction, !isVerified && { opacity: 0.2 }]} disabled={!isVerified} onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}>
              <Text style={G.btnText}>✉️ Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SPODNÁ AKCIA */}
        <View style={{ width: '100%', marginTop: 25, gap: 15 }}>
          {isOwner ? (
            <>
              {/* Pôvodné tlačidlo */}
              <TouchableOpacity 
                style={{ padding: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F0F', borderRadius: 10 }} 
                onPress={() => navigation.navigate('CardEditor')}
              >
                <Text style={[G.textCyber, { color: '#F0F' }]}>[ UPRAVIŤ MOJU PEČAŤ ]</Text>
              </TouchableOpacity>

              {/* NOVÉ TLAČIDLO GENEROVAŤ QR */}
              <TouchableOpacity 
                style={{ padding: 15, alignItems: 'center', backgroundColor: '#060', borderWidth: 1, borderColor: '#0F0', borderRadius: 10 }} 
                onPress={() => setShowQR(!showQR)}
              >
                <Text style={[G.textCyber, { color: '#0F0' }]}>
                [ {showQR ? 'SKRYŤ PEČAŤ' : 'GENEROVAŤ QR'} ]
                </Text>
              </TouchableOpacity>

              {/* ZOBRAZENIE QR KÓDU */}
              {showQR && (
                <View style={{ alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15 }}>
                  <QRCode
                    value={qrValue}
                    size={200}
                    logo={require('../../assets/laria-seal.png')} // Sem vlož svoje logo!
                    logoSize={40}
                    logoBackgroundColor='white'
                    logoBorderRadius={0}
                    quietZone={10}
                  />
                  <Text style={{ color: '#000', marginTop: 10, fontSize: 10, fontWeight: 'bold' }}>OFFLINE IDENTITY QR</Text>
                </View>
              )}
            </>
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