/**
 * LARIA v2.0: CardScreen (Moja Pečať)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_RESTORED_STABLE
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, Platform } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import { G, ACCENT } from '../styles/styles'; 
import { useLaria } from '../../context/LariaContext';    
import { useContacts } from '../../context/ContactContext'; 

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { togglePin } = useContacts(); 
  const { contact } = route.params || {};
  
  const isOwner = !contact;
  const [showQR, setShowQR] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);

  // --- MAPOVANIE IDENTITY (FING-CENTRIC) ---
  const item = isOwner ? {
    kat: vault?.identity?.kat || "MASTER ARCHITECT",
    meno: vault?.identity?.meno || "Sammael",
    lok: vault?.identity?.lok || "Rákoš / Matrix",
    popis: vault?.identity?.popis || "Rustic, steampunk a avantgardné stolárstvo.",
    tel: vault?.identity?.tel,
    email: vault?.identity?.email,
    fb: vault?.identity?.fb,
    tg: vault?.identity?.tg,
    gal: vault?.identity?.gal,
    sha: vault?.identity?.sha,
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
  const qrValue = `https://sammael-ag.github.io/LARIA/?id=${item.fing}&m=${encodeURIComponent(item.meno)}&k=${item.krypt || ''}`;

  const openLink = (url) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(cleanUrl).catch(() => Alert.alert("Chyba", "Nepodarilo sa otvoriť odkaz."));
  };

  const handleNfcBeam = async () => {
    if (isNfcActive) return;
    try {
      setIsNfcActive(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(qrValue)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        if (Platform.OS === 'ios') Alert.alert("PEČAŤ PRENESENÁ", "Tvoja pečať bola odoslaná.");
      }
    } catch (ex) {
      console.log("NFC Beam pasívny.");
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsNfcActive(false);
    }
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      {/* G.scrollPadding zachovaný pre správnu dedičnosť geometrie */}
      <ScrollView contentContainerStyle={G.scrollPadding}>
        
        {/* IDENTITA BAR */}
        <View style={{ marginBottom: 20 }}>
          <Text style={G.atelierTitle}>{isOwner ? "MOJA PEČAŤ" : "PEČAŤ MAJSTRA"}</Text>
          <Text style={[G.monoIdentity, { textAlign: 'center', marginTop: -15 }]}>FING: {item.fing}</Text>
        </View>

        {/* HLAVNÁ KARTA */}
        <View style={[G.card, item.pinned && !isOwner && { borderColor: '#c5a059' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={G.tagBadge}>
               <Text style={G.tagBadgeText}>{(item.kat || "USER").toUpperCase()}</Text>
            </View>
            {!isOwner && (
              <TouchableOpacity onPress={() => togglePin(item.fing)}>
                <Text style={{ fontSize: 24 }}>{item.pinned ? '⭐' : '📌'}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[G.cardTitleText, { fontSize: 28, marginBottom: 5 }]}>{item.meno}</Text>
          <Text style={[G.statusTextSmall, { opacity: 0.6 }]}>📍 {item.lok}</Text>
          
          <View style={G.divider} />
          
          <Text style={G.cardDescriptionText}>
            {item.popis || 'Spiace vedomie bez popisu...'}
          </Text>

          {/* SOCIÁLNE SIETE */}
          <View style={[G.actionRow, { marginTop: 10 }]}>
            {item.fb && <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.fb)}><Text style={G.statusTextSmall}>FB</Text></TouchableOpacity>}
            {item.tg && <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.tg)}><Text style={G.statusTextSmall}>TG</Text></TouchableOpacity>}
            {item.gal && <TouchableOpacity style={[G.miniBtn, { borderColor: '#c5a059' }]} onPress={() => openLink(item.gal)}><Text style={[G.statusTextSmall, { color: '#c5a059' }]}>GALÉRIA</Text></TouchableOpacity>}
          </View>
          
          {/* RÝCHLE AKCIE */}
          <View style={G.actionRow}>
            <TouchableOpacity style={G.miniBtn} onPress={() => item.tel && Linking.openURL(`tel:${item.tel}`)}><Text style={G.statusTextSmall}>VOLAŤ</Text></TouchableOpacity>
            <TouchableOpacity style={G.miniBtn} onPress={() => Alert.alert('DÁTA PEČATE', `SHA: ${item.sha}\nKRYPT: ${item.krypt || 'Offline'}`)}><Text style={G.statusTextSmall}>DÁTA</Text></TouchableOpacity>
            <TouchableOpacity style={G.miniBtn} onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}><Text style={G.statusTextSmall}>EMAIL</Text></TouchableOpacity>
          </View>
        </View>

        {/* INTERAKCIA MAJSTRA */}
        <View style={{ width: '100%', marginTop: 20 }}>
          {isOwner ? (
            <>
              <TouchableOpacity style={[G.primaryBtn, { borderStyle: 'dashed' }]} onPress={() => navigation.navigate('CardEditor')}>
                <Text style={G.primaryBtnText}>[ PRETESAŤ MOJU PEČAŤ ]</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[G.primaryBtn, { marginTop: 15 }]} onPress={() => setShowQR(!showQR)}>
                <Text style={G.primaryBtnText}>{showQR ? '[ SKRYŤ PEČAŤ ]' : '[ VYSTAVIŤ PEČAŤ ]'}</Text>
              </TouchableOpacity>

              {showQR && (
                <View style={{ alignItems: 'center', marginTop: 20, width: '100%' }}>
                  <View style={G.qrWrapper}>
                    {/* Skrotenie QR kódu pre 25% wrapper */}
                    <View style={{ width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <QRCode 
                        value={qrValue} 
                        size={150} 
                        logo={require('../../assets/laria-seal.png')} 
                        logoSize={35} 
                        logoBackgroundColor='white' 
                      />
                    </View>
                  </View>
                  <Text style={[G.monoIdentity, { marginTop: 15 }]}>{item.meno.toUpperCase()}</Text>
                  
                  <TouchableOpacity 
                    style={[G.primaryBtn, { 
                      backgroundColor: isNfcActive ? (ACCENT || '#c5a059') : 'transparent', 
                      marginTop: 20 
                    }]} 
                    onPress={() => !isNfcActive && handleNfcBeam()}
                  >
                    <Text style={[G.primaryBtnText, { color: isNfcActive ? '#1a1a1a' : (ACCENT || '#c5a059') }]}>
                      {isNfcActive ? '📡 VYSIELAM...' : '📡 NFC BEAM'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity style={G.primaryBtn} onPress={() => navigation.navigate('IRC', { target: item })}>
              <Text style={G.primaryBtnText}>{isVerified ? '[ BEZPEČNÝ KANÁL ]' : '[ OVERIŤ V MATRIXE ]'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={{ marginTop: 40, marginBottom: 20 }} onPress={() => navigation.goBack()}>
          <Text style={[G.statusTextSmall, { textAlign: 'center', letterSpacing: 4 }]}>[ NÁVRAT DO ATELIÉRU ]</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;