import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, Platform } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 

// --- NFC MODUL ---
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

// --- GLOBÁLNE ŠTÝLY A KONTEXTY ---
import { G } from '../styles/styles'; 
import { useLaria } from '../../context/LariaContext';    
import { useContacts } from '../../context/ContactContext'; 

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { togglePin } = useContacts(); 
  const { contact } = route.params || {};
  
  // Sammael, tu určujeme, či sa pozeráš do zrkadla (isOwner) alebo na niekoho iného
  const isOwner = !contact;
  
  const [showQR, setShowQR] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);

  // --- MAPOVANIE IDENTITY v8.0 ---
  // Používame premenné meno, kat, lok a krypt presne podľa Matrixu
  const item = isOwner ? {
    kat: vault.identity.kat || "MASTER CARPENTER",
    meno: vault.identity.meno || "Sammael",
    lok: vault.identity.lok || "Rákoš / Rožňava / Revúca",
    popis: vault.identity.popis || "Rustic, steampunk a avantgardné stolárstvo.",
    tel: vault.identity.tel,
    email: vault.identity.email,
    sha: vault.identity.sha,
    krypt: vault.identity.krypt,
    pinned: true 
  } : {
    ...contact,
    // Ak je to kontakt z Matrixu, zjednotíme meno a id pre zobrazenie
    meno: contact.meno || contact.name,
    sha: contact.sha || contact.id,
    krypt: contact.krypt || contact.wallet
  };

  const isVerified = isOwner || item.isVerified;

  // --- NFC BEAM LOGIKA (Vysielanie identity dotykom) ---
  const handleNfcBeam = async () => {
    if (isNfcActive) return;
    try {
      setIsNfcActive(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      // Protokol v8.0: Meno | SHA | Krypt (Wallet)
      const dataPayload = `LARIA:${item.meno}|${item.sha}|${item.krypt || 'NO_KRYPT'}|v8.0`;
      const bytes = Ndef.encodeMessage([Ndef.textRecord(dataPayload)]);
      
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        if (Platform.OS === 'ios') {
          Alert.alert("PEČAŤ PRENESENÁ", "Tvoja multidimenzionálna pečať bola odoslaná.");
        }
      }
    } catch (ex) {
      console.log("NFC Beam pasívny.");
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsNfcActive(false);
    }
  };

  const handleTogglePin = async () => {
    if (!isOwner) {
      const contactId = item.sha || item.id;
      await togglePin(contactId);
      navigation.setParams({ contact: { ...contact, pinned: !contact.pinned } });
    }
  };

  // Dáta pre QR kód (Kompaktný formát pre Matrix skener)
  const qrValue = JSON.stringify({
    m: item.meno,
    s: item.sha,
    k: item.krypt,
    v: "8.0"
  });

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.scrollContent}>
        
        {/* --- HLAVNÁ VIZITKA (Tvoj digitálny artefakt) --- */}
        <View style={[G.card, item.pinned && !isOwner && { borderColor: '#0FF', borderWidth: 1 }]}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={G.tag}>{item.kat.toUpperCase()}</Text>
            {!isOwner && (
              <TouchableOpacity onPress={handleTogglePin} style={{ padding: 10 }}>
                <Text style={{ fontSize: 24 }}>{item.pinned ? '📍' : '📌'}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[G.textWhite, { fontSize: 28, fontWeight: '700', marginBottom: 8, letterSpacing: 1 }]}>
            {item.meno}
          </Text>
          <Text style={G.textDim}>📍 {item.lok}</Text>
          <View style={G.divider} />
          <Text style={[G.textMain, { fontStyle: 'italic', lineHeight: 26, marginBottom: 35, fontSize: 15 }]}>
            {item.popis}
          </Text>
          
          {/* Akčné prvky (Volanie, Email, ID) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
            <TouchableOpacity 
              style={[G.btnAction, !item.tel && { opacity: 0.2 }]} 
              disabled={!item.tel} 
              onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}
            >
              <Text style={G.btnText}>Volať</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={G.btnAction} 
              onPress={() => Alert.alert('HDPN PEČAŤ v8.0', `SHA: ${item.sha}\nKRYPT: ${item.krypt || 'Neaktívny'}`)}
            >
              <Text style={G.btnText}>Dáta</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[G.btnAction, !item.email && { opacity: 0.2 }]} 
              disabled={!item.email} 
              onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
            >
              <Text style={G.btnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SEKCIA INTERAKCIÍ --- */}
        <View style={{ width: '100%', marginTop: 30, gap: 15 }}>
          {isOwner ? (
            <>
              {/* Tlačidlo pre úpravu vlastnej identity */}
              <TouchableOpacity 
                style={{ padding: 18, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#b19cd9', borderRadius: 12 }} 
                onPress={() => navigation.navigate('CardEditor')}
              >
                <Text style={[G.textCyber, { color: '#b19cd9', fontWeight: 'bold' }]}>
                  [ PRETESAŤ MOJU PEČAŤ ]
                </Text>
              </TouchableOpacity>

              {/* QR a NFC vysielanie */}
              <TouchableOpacity 
                style={{ padding: 18, alignItems: 'center', backgroundColor: showQR ? '#111' : '#040', borderWidth: 1, borderColor: showQR ? '#444' : '#0F0', borderRadius: 12 }} 
                onPress={() => setShowQR(!showQR)}
              >
                <Text style={[G.textCyber, { color: showQR ? '#AAA' : '#0F0', fontWeight: 'bold' }]}>
                  [ {showQR ? 'SKRYŤ PEČAŤ' : 'VYSTAVIŤ PEČAŤ PRE MATRIX'} ]
                </Text>
              </TouchableOpacity>

              {showQR && (
                <View style={{ alignItems: 'center', marginTop: 25 }}>
                  <View style={{ 
                    alignItems: 'center', 
                    padding: 25, 
                    backgroundColor: '#FFF', 
                    borderRadius: 20,
                    borderWidth: 4,
                    borderColor: '#b19cd9' 
                  }}>
                    <QRCode 
                      value={qrValue} 
                      size={200} 
                      logo={require('../../assets/laria-seal.png')} // Sammael, over či máš tento asset!
                      logoSize={50} 
                      logoBackgroundColor='transparent'
                    />
                    
                    <Text style={{ color: '#000', marginTop: 15, fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>
                      {item.meno.toUpperCase()}
                    </Text>
                    <Text style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
                      LARIA HDPN PROTOCOL v8.0
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={{ 
                      marginTop: 20, 
                      padding: 15, 
                      width: '100%', 
                      alignItems: 'center', 
                      backgroundColor: isNfcActive ? '#022' : '#111', 
                      borderRadius: 12, 
                      borderWidth: 1, 
                      borderColor: isNfcActive ? '#0FF' : '#333' 
                    }}
                    onPress={handleNfcBeam}
                    disabled={isNfcActive}
                  >
                    <Text style={[G.textCyber, { color: isNfcActive ? '#FFF' : '#0FF', fontSize: 12 }]}>
                      {isNfcActive ? '📡 VYSIELAM PEČAŤ DOTYKOM...' : '📡 AKTIVOVAŤ NFC BEAM'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            // Ak pozeráš cudzí kontakt
            <TouchableOpacity 
              style={[G.ircButton, !isVerified && { borderColor: '#444', backgroundColor: '#111' }]} 
              onPress={() => navigation.navigate('IRC', { target: item })}
            >
              <Text style={G.ircButtonText}>
                {isVerified ? 'OTVORIŤ BEZPEČNÝ KANÁL' : 'OVERIŤ V MATRIXE'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={{ marginTop: 50, padding: 15, alignItems: 'center' }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[G.textDim, { letterSpacing: 4, fontSize: 12 }]}>
            [ NÁVRAT DO ATELIÉRU ]
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;