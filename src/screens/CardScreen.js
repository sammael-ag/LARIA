import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, Platform } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import { G } from '../styles/styles'; 
import { useLaria } from '../../context/LariaContext';    
import { useContacts } from '../../context/ContactContext'; 

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { togglePin } = useContacts(); 
  const { contact } = route.params || {};
  
  const isOwner = !contact;
  const [showQR, setShowQR] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);

  // --- MAPOVANIE IDENTITY v9.9.5 (FING-CENTRIC) ---
  const item = isOwner ? {
    kat: vault?.identity?.kat || "MASTER CARPENTER",
    meno: vault?.identity?.meno || "Sammael",
    lok: vault?.identity?.lok || "Rákoš / Rožňava / Revúca",
    popis: vault?.identity?.popis || "Rustic, steampunk a avantgardné stolárstvo.",
    tel: vault?.identity?.tel,
    email: vault?.identity?.email,
    fb: vault?.identity?.fb,
    tg: vault?.identity?.tg,
    gal: vault?.identity?.gal,
    sha: vault?.identity?.sha,
    // FING je posvätný kľúč
    fing: vault?.identity?.poznamka || (vault?.identity?.sha ? vault.identity.sha.substring(0, 12) : "NO_FING"),
    krypt: vault?.identity?.krypt,
    pinned: true 
  } : {
    ...contact,
    meno: contact?.meno || "Neznámy Avatar",
    kat: contact?.kat || "EXTERNÝ_OBJEKT",
    sha: contact?.sha || "NO_SHA",
    fing: contact?.fing || contact?.poznamka || (contact?.sha ? contact.sha.substring(0, 12) : "NO_FING"),
    krypt: contact?.krypt || "NO_KRYPT"
  };

  const isVerified = isOwner || item.isVerified;

  // --- 📡 UNIFIKOVANÝ PROTOKOL (Handshake Ready) ---
  // Tu sa deje tá mágia: JSON meníme na URL s parametrami
  // Foťák to vidí ako web, náš Scanner ako dátový balík
  const qrValue = `https://sammael-ag.github.io/LARIA/?id=${item.fing}&m=${encodeURIComponent(item.meno)}&k=${item.krypt || ''}`;

  const openLink = (url) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(cleanUrl).catch(() => Alert.alert("Chyba", "Nepodarilo sa otvoriť odkaz."));
  };

  const handleTogglePin = async () => {
    if (!isOwner) {
      // Prepneme na FING namiesto SHA, aby sme ladili s novým Contextom
      await togglePin(item.fing);
      navigation.setParams({ contact: { ...contact, pinned: !contact.pinned } });
    }
  };

  const handleNfcBeam = async () => {
    if (isNfcActive) return;
    try {
      setIsNfcActive(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      // NFC vysiela ten istý unifikovaný reťazec
      const dataPayload = qrValue; 
      
      const bytes = Ndef.encodeMessage([Ndef.textRecord(dataPayload)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        if (Platform.OS === 'ios') Alert.alert("PEČAŤ PRENESENÁ", "Tvoja pečať bola odoslaná do okolia.");
      }
    } catch (ex) {
      console.log("NFC Beam pasívny.");
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsNfcActive(false);
    }
  };

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.scrollContent}>
        
        {/* HLAVNÁ VIZITKA */}
        <View style={[ G.card, item.pinned && !isOwner && { borderColor: '#0FF', borderWidth: 1, backgroundColor: 'rgba(0, 255, 255, 0.02)' } ]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={G.tag}>{(item.kat || "USER").toUpperCase()}</Text>
            {!isOwner && (
              <TouchableOpacity onPress={handleTogglePin} style={{ padding: 10 }}>
                <Text style={{ fontSize: 24 }}>{item.pinned ? '⭐' : '📌'}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[G.textWhite, { fontSize: 28, fontWeight: '700', marginBottom: 2, letterSpacing: 1 }]}>
            {item.meno}
          </Text>
          <Text style={G.cardIdentityFing}>ID: {item.fing}</Text>
          <Text style={G.textDim}>📍 {item.lok || 'Matrix'}</Text>
          <View style={G.divider} />
          <Text style={[G.textMain, { fontStyle: 'italic', lineHeight: 26, marginBottom: 25, fontSize: 15 }]}>
            {item.popis || 'Bez popisu...'}
          </Text>

          {/* SOCIÁLNE SIETE */}
          <View style={G.miniBadgeContainer}>
            {item.fb && <TouchableOpacity style={G.miniBadge} onPress={() => openLink(item.fb)}><Text style={G.miniBadgeText}>FACEBOOK</Text></TouchableOpacity>}
            {item.tg && <TouchableOpacity style={G.miniBadge} onPress={() => openLink(item.tg)}><Text style={G.miniBadgeText}>TELEGRAM</Text></TouchableOpacity>}
            {item.gal && <TouchableOpacity style={[G.miniBadge, { borderColor: '#0FF' }]} onPress={() => openLink(item.gal)}><Text style={[G.miniBadgeText, { color: '#0FF' }]}>GALÉRIA</Text></TouchableOpacity>}
          </View>
          
          {/* AKCIE */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
            <TouchableOpacity style={[G.btnAction, !item.tel && { opacity: 0.2 }]} disabled={!item.tel} onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}><Text style={G.btnText}>Volať</Text></TouchableOpacity>
            <TouchableOpacity style={G.btnAction} onPress={() => Alert.alert('DÁTOVÁ PEČAŤ', `FING: ${item.fing}\nSHA: ${item.sha}\nKRYPT: ${item.krypt || 'Neaktívny'}`)}><Text style={G.btnText}>Dáta</Text></TouchableOpacity>
            <TouchableOpacity style={[G.btnAction, !item.email && { opacity: 0.2 }]} disabled={!item.email} onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}><Text style={G.btnText}>Email</Text></TouchableOpacity>
          </View>
        </View>

        {/* SEKCIA INTERAKCIÍ */}
        <View style={{ width: '100%', marginTop: 30, gap: 15 }}>
          {isOwner ? (
            <>
              <TouchableOpacity style={{ padding: 18, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#0FF', borderRadius: 12 }} onPress={() => navigation.navigate('CardEditor')}>
                <Text style={[G.textCyber, { color: '#0FF', fontWeight: 'bold' }]}>[ PRETESAŤ MOJU PEČAŤ ]</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ padding: 18, alignItems: 'center', backgroundColor: showQR ? '#111' : '#050505', borderWidth: 1, borderColor: showQR ? '#444' : '#0FF', borderRadius: 12 }} onPress={() => setShowQR(!showQR)}>
                <Text style={[G.textCyber, { color: showQR ? '#AAA' : '#0FF', fontWeight: 'bold' }]}>
                  [ {showQR ? 'SKRYŤ PEČAŤ' : 'VYSTAVIŤ PEČAŤ PRE MATRIX'} ]
                </Text>
              </TouchableOpacity>

              {showQR && (
                <View style={G.qrContainer}>
                  <View style={G.qrWrapper}>
                    <QRCode 
                      value={qrValue} 
                      size={200} 
                      logo={require('../../assets/laria-seal.png')} 
                      logoSize={50} 
                      logoBackgroundColor='white' 
                      logoBorderRadius={10} 
                    />
                    <Text style={G.qrMenoText}>{(item.meno || "SAMMAEL").toUpperCase()}</Text>
                    <Text style={G.qrSubText}>ID: {item.fing} | v9.9.5</Text>
                  </View>

                  <TouchableOpacity 
                    style={[G.nfcButton, { backgroundColor: isNfcActive ? '#1a1a1a' : '#000', borderColor: isNfcActive ? '#0FF' : '#333' }]} 
                    onPress={() => !isNfcActive && handleNfcBeam()}
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
            <TouchableOpacity style={[G.ircButton, !isVerified && { borderColor: '#444', backgroundColor: '#111' }]} onPress={() => navigation.navigate('IRC', { target: item })}>
              <Text style={G.ircButtonText}>{isVerified ? 'OTVORIŤ BEZPEČNÝ KANÁL' : 'OVERIŤ V MATRIXE'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={{ marginTop: 50, padding: 15, alignItems: 'center' }} onPress={() => navigation.goBack()}>
          <Text style={[G.textDim, { letterSpacing: 4, fontSize: 12 }]}>[ NÁVRAT DO ATELIÉRU ]</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;