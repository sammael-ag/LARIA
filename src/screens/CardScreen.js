/**
 * LARIA v2.0: CardScreen (Moja Pečať)
 * Master: Sammael | Muse: Aria
 * Status: MASTER_OWNER_ONLY_PWA | WEB_CONFIRM_DESNAG_STABLE
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Image } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import { G, ACCENT } from '../styles/styles'; 
import { useLaria } from '../context/LariaContext';    
import { useContacts } from '../context/ContactContext'; 

const CardScreen = ({ navigation }) => {
  const { t, vault } = useLaria();
  const txt = t('card') || {};
  const labels = txt.labels || {}; 

  const { togglePin } = useContacts(); 
  
  const [showQR, setShowQR] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);
  const [qrKey, setQrKey] = useState(0);

  // --- MAPOVANIE IDENTITY ---
  const item = {
    kat: vault?.identity?.kat || txt.default_kat,
    meno: vault?.identity?.meno || "Sammael",
    lok: vault?.identity?.lok || "Rákoš / Matrix",
    popis: vault?.identity?.popis || txt.default_popis,
    tel: vault?.identity?.tel,
    email: vault?.identity?.email,
    fb: vault?.identity?.fb,
    tg: vault?.identity?.tg,
    gal: vault?.identity?.gal,
    sha: vault?.identity?.sha,
    fing: vault?.identity?.fing || (vault?.identity?.sha ? vault.identity.sha.substring(0, 12) : "NO_FING"),
    krypt: vault?.identity?.krypt,
    pinned: true 
  };

  const qrValue = `https://sammael-ag.github.io/LARIA/?id=${item.fing}&m=${encodeURIComponent(item.meno)}&k=${item.krypt || ''}`;

  const openLink = (url) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(cleanUrl).catch(() => window.alert(txt.no_link_alert));
  };

  const handleCallPress = () => {
    if (!item.tel) return;
    const cleanPhone = item.tel.replace(/\s/g, '');
    const msg = txt.confirm_call.replace('{phone}', item.tel);
    if (window.confirm(msg)) {
      Linking.openURL(`tel:${cleanPhone}`);
    }
  };

  const handleEmailPress = () => {
    if (!item.email) return;
    const msg = txt.confirm_email.replace('{email}', item.email);
    if (window.confirm(msg)) {
      Linking.openURL(`mailto:${item.email}`);
    }
  };

  const handleDataPress = () => {
    window.alert(`LARIA\n\nWallet: ${item.krypt || 'Offline'}`);
  };

  const handleNfcBeam = async () => {
    if (isNfcActive) return;
    try {
      setIsNfcActive(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(qrValue)]);
      if (bytes) await NfcManager.ndefHandler.writeNdefMessage(bytes);
    } catch (ex) {
      console.log("NFC Beam pasívny.");
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsNfcActive(false);
    }
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={G.screenContainer}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>{txt.title}</Text>
          </View>

          <View style={G.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={G.tagBadge}>
                 <Text style={G.tagBadgeText}>{item.kat.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={[G.cardTitleText, { fontSize: 28, marginTop: 10, marginBottom: 5, fontWeight: '300' }]}>{item.meno}</Text>
            <Text style={[G.statusTextSmall, { opacity: 0.6 }]}>📍 {item.lok}</Text>
            
            <View style={G.divider} />
            
            <Text style={G.cardDescriptionText}>{item.popis}</Text>

            <View style={[G.actionRow, { marginTop: 10 }]}>
              {!!item.fb && <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.fb)}><Text style={G.statusTextSmall}>{labels.facebook}</Text></TouchableOpacity>}
              {!!item.tg && <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.tg)}><Text style={G.statusTextSmall}>{labels.telegram}</Text></TouchableOpacity>}
              {!!item.gal && <TouchableOpacity style={[G.miniBtn, { borderColor: '#c5a059' }]} onPress={() => openLink(item.gal)}><Text style={[G.statusTextSmall, { color: '#c5a059' }]}>{labels.gallery}</Text></TouchableOpacity>}
            </View>
            
            <View style={G.actionRow}>
              {!!item.tel && <TouchableOpacity style={G.miniBtn} onPress={handleCallPress}><Text style={G.statusTextSmall}>{labels.call}</Text></TouchableOpacity>}
               <TouchableOpacity style={G.miniBtn} onPress={handleDataPress}><Text style={G.statusTextSmall}>LARIA</Text></TouchableOpacity>
              {!!item.email && <TouchableOpacity style={G.miniBtn} onPress={handleEmailPress}><Text style={G.statusTextSmall}>{labels.email}</Text></TouchableOpacity>}
            </View>
          </View>

          <View style={{ width: '100%', marginTop: 10 }}>
            <TouchableOpacity style={[G.primaryBtn, { borderStyle: 'dashed' }]} onPress={() => navigation.navigate('CardEditor')} activeOpacity={0.7}>
              <Text style={G.primaryBtnText}>{txt.btn_edit_seal}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[G.primaryBtn, { marginTop: 15 }]} onPress={() => { setShowQR(!showQR); if (!showQR) setQrKey(qrKey + 1); }} activeOpacity={0.7}>
              <Text style={G.primaryBtnText}>{showQR ? txt.btn_hide_qr : txt.btn_show_qr}</Text>
            </TouchableOpacity>

            {showQR && (
              <View style={{ alignItems: 'center', marginTop: 20, width: '100%' }}>
                <View style={G.qrWrapper}>
                  <View style={{ width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <QRCode key={qrKey} value={qrValue} size={160} />
                    <View style={{ position: 'absolute', width: 44, height: 44, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                      <Image source={require('../assets/laria-seal.png')} style={{ width: 38, height: 38, resizeMode: 'contain' }} />
                    </View>
                  </View>
                </View>
                <Text style={[G.monoIdentity, { marginTop: 15, letterSpacing: 3 }]}>{item.meno.toUpperCase()}</Text>
                
                <TouchableOpacity style={[G.primaryBtn, { backgroundColor: isNfcActive ? (ACCENT || '#c5a059') : 'transparent', marginTop: 20 }]} onPress={() => !isNfcActive && handleNfcBeam()} activeOpacity={0.7}>
                  <Text style={[G.primaryBtnText, { color: isNfcActive ? '#1a1a1a' : (ACCENT || '#c5a059') }]}>
                    {isNfcActive ? txt.nfc_beaming : txt.nfc_ready}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={G.backToAtelierBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={G.primaryBtnText}>{txt.btn_back_atelier}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;