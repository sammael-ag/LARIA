/**
 * LARIA v2.0: CardScreen (Moja Pečať)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_OVERLAY_PWA_STABLE
 * Oprava: Nadpisy kompletne zladené s jemnou typografiou a geometriou AriaScreen (vrátane záporných marginov).
 * Odstránený obrovský Base64 string, nahradený čistým načítaním lokálneho loga z assetov cez require().
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, Platform, Image } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import { G, ACCENT } from '../styles/styles'; 
import { useLaria } from '../context/LariaContext';    
import { useContacts } from '../context/ContactContext'; 

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { togglePin } = useContacts(); 
  const { contact } = route.params || {};
  
  const isOwner = !contact;
  const [showQR, setShowQR] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);
  
  // Poistka pre vynútené načítanie
  const [qrKey, setQrKey] = useState(0);

  // --- MAPOVANIE IDENTITY ---
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
      
      {/* ⬅️ PRE PROGRESÍVCOV: Navigačná šípka */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 📐 HLAVNÝ OBSAH */}
      <ScrollView contentContainerStyle={G.screenContainer}>
        
        {/* Kontajner s max šírkou 500px */}
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
          
          {/* 🌸 IDENTITA BAR V ŠTÝLE ARIA_SCREEN */}
          <View style={{ alignItems: 'center' }}>
            <Text style={G.atelierTitle}>
              {isOwner ? "Moja pečať" : "Pečať majstra"}
            </Text>
            <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: -15, marginBottom: 20 }]}>
              FING: {item.fing?.toUpperCase()}
            </Text>
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
            
            <Text style={[G.cardTitleText, { fontSize: 28, marginBottom: 5, fontWeight: '300' }]}>{item.meno}</Text>
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
          <View style={{ width: '100%', marginTop: 10 }}>
            {isOwner ? (
              <>
                <TouchableOpacity 
                  style={[G.primaryBtn, { borderStyle: 'dashed' }]} 
                  onPress={() => navigation.navigate('CardEditor')}
                  activeOpacity={0.7}
                >
                  <Text style={G.primaryBtnText}>PRETESAŤ MOJU PEČAŤ</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[G.primaryBtn, { marginTop: 15 }]} 
                  onPress={() => {
                    setShowQR(!showQR);
                    if (!showQR) setQrKey(qrKey + 1);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={G.primaryBtnText}>{showQR ? 'SKRYŤ PEČAŤ' : 'VYSTAVIŤ PEČAŤ'}</Text>
                </TouchableOpacity>

                {showQR && (
                  <View style={{ alignItems: 'center', marginTop: 20, width: '100%' }}>
                    <View style={G.qrWrapper}>
                      
                      {/* 🛠️ POZÍCIOVACÍ TRÓN PRE ABSOLÚTNE VRSTVENIE */}
                      <View style={{ width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        
                        {/* Čistý QR kód generovaný bez chybových log parametrov */}
                        <QRCode 
                          key={qrKey}
                          value={qrValue} 
                          size={160} 
                        />

                        {/* ⬛️ PRÍSNY ŠTVOREC LOGA POSADENÝ EXPLICITNE DO STREDU */}
                        <View style={{
                          position: 'absolute',
                          width: 44,              // O niečo väčší obal (vytvorí prirodzený ochranný margin)
                          height: 44,
                          backgroundColor: '#FFFFFF', // Čisté biele pozadie pod logom na prekrytie bodiek QR kódu
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Image 
                            source={require('../assets/laria-seal.png')}
                            style={{
                              width: 38,          // Samotný presný rozmer loga
                              height: 38,
                              resizeMode: 'contain',
                            }}
                          />
                        </View>

                      </View>
                    </View>
                    <Text style={[G.monoIdentity, { marginTop: 15, letterSpacing: 3 }]}>{item.meno.toUpperCase()}</Text>
                    
                    <TouchableOpacity 
                      style={[G.primaryBtn, { 
                        backgroundColor: isNfcActive ? (ACCENT || '#c5a059') : 'transparent', 
                        marginTop: 20 
                      }]} 
                      onPress={() => !isNfcActive && handleNfcBeam()}
                      activeOpacity={0.7}
                    >
                      <Text style={[G.primaryBtnText, { color: isNfcActive ? '#1a1a1a' : (ACCENT || '#c5a059') }]}>
                        {isNfcActive ? '📡 VYSIELAM...' : '📡 NFC BEAM'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <TouchableOpacity 
                style={G.primaryBtn} 
                onPress={() => navigation.navigate('IRC', { target: item })}
                activeOpacity={0.7}
              >
                <Text style={G.primaryBtnText}>{isVerified ? 'BEZPEČNÝ KANÁL' : 'OVERIŤ V MATRIXE'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ↩️ PRE KONZERVATÍVCOV: Spodný návrat */}
          <TouchableOpacity 
            style={G.backToAtelierBtn}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;