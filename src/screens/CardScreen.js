import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 

// --- GLOBÁLNE ŠTÝLY A KONTEXTY ---
import { G } from '../styles/styles'; 
import { useLaria } from '../../context/LariaContext';    
import { useContacts } from '../../context/ContactContext'; 

const CardScreen = ({ route, navigation }) => {
  const { vault } = useLaria();
  const { togglePin } = useContacts(); 
  const { contact } = route.params || {};
  const isOwner = !contact;
  
  const [showQR, setShowQR] = useState(false);

  const item = isOwner ? {
    kat: "MASTER CARPENTER",
    meno: vault.identity.name || vault.identity.meno,
    lok: vault.identity.lok || "Rákoš / Rožňava / Revúca",
    popis: vault.identity.popis || "Rustic, steampunk a avantgardné stolárstvo.",
    tel: vault.identity.tel,
    email: vault.identity.email,
    sha: vault.identity.sha,
    wallet: vault.identity.walletAddress,
    pinned: true 
  } : {
    ...contact,
    meno: contact.name,
    sha: contact.id
  };

  const isVerified = isOwner || item.isVerified;

  const handleTogglePin = async () => {
    if (!isOwner) {
      await togglePin(item.id);
      navigation.setParams({ contact: { ...contact, pinned: !contact.pinned } });
    }
  };

  const qrValue = JSON.stringify({
    n: item.meno,
    a: item.wallet || item.sha,
    v: "7.9.2"
  });

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.scrollContent}>
        
        {/* --- HLAVNÁ VIZITKA (KARTA) --- */}
        <View style={[
          G.card, 
          item.pinned && !isOwner && { borderColor: '#0FF', borderWidth: 1 }
        ]}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={G.tag}>{item.kat}</Text>
            {!isOwner && (
              <TouchableOpacity onPress={handleTogglePin} style={{ padding: 10 }}>
                <Text style={{ fontSize: 24 }}>{item.pinned ? '📍' : '📌'}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[G.textWhite, { fontSize: 26, fontWeight: '700', marginBottom: 8 }]}>
            {item.meno}
          </Text>
          <Text style={G.textDim}>📍 {item.lok}</Text>
          <View style={G.divider} />
          <Text style={[G.textMain, { fontStyle: 'italic', lineHeight: 24, marginBottom: 35 }]}>
            {item.popis}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
            <TouchableOpacity 
              style={[G.btnAction, !isVerified && { opacity: 0.2 }]} 
              disabled={!isVerified} 
              onPress={() => item.tel && Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}
            >
              <Text style={G.btnText}>📞 VOLAŤ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={G.btnAction} 
              onPress={() => Alert.alert('HDPN PEČAŤ', `SHA-256 ID: ${item.sha || 'MASTER_SOURCE'}`)}
            >
              <Text style={G.btnText}>🔗 ID</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[G.btnAction, !isVerified && { opacity: 0.2 }]} 
              disabled={!isVerified} 
              onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
            >
              <Text style={G.btnText}>✉️ EMAIL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SEKCIA AKCIÍ --- */}
        <View style={{ width: '100%', marginTop: 30, gap: 15 }}>
          {isOwner ? (
            <>
              <TouchableOpacity 
                style={{ 
                  padding: 18, 
                  alignItems: 'center', 
                  borderStyle: 'dashed', 
                  borderWidth: 1.5, 
                  borderColor: '#b19cd9', 
                  borderRadius: 12 
                }} 
                onPress={() => navigation.navigate('CardEditor')}
              >
                <Text style={[G.textCyber, { color: '#b19cd9', fontWeight: 'bold' }]}>
                  [ UPRAVIŤ MOJU PEČAŤ ]
                </Text>
              </TouchableOpacity>

              {/* ZELENÉ TLAČIDLO S NOVÝM TEXTOM */}
              <TouchableOpacity 
                style={{ 
                  padding: 18, 
                  alignItems: 'center', 
                  backgroundColor: '#040', 
                  borderWidth: 1, 
                  borderColor: '#0F0', 
                  borderRadius: 12 
                }} 
                onPress={() => setShowQR(!showQR)}
              >
                <Text style={[G.textCyber, { color: '#0F0', fontWeight: 'bold' }]}>
                  [ {showQR ? 'ZATVORIŤ PEČAŤ' : 'VYSTAVIŤ PEČAŤ (QR ALEBO NFC)'} ]
                </Text>
              </TouchableOpacity>

              {/* DYNAMICKÝ QR DISPLEJ + NFC TLAČIDLO */}
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
                    <QRCode value={qrValue} size={220} quietZone={10} />
                    <Text style={{ color: '#000', marginTop: 15, fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>
                      {item.meno.toUpperCase()}
                    </Text>
                    <Text style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
                      LARIA HDPN IDENTITY PROTOCOL v7.9.2
                    </Text>
                  </View>

                  {/* NOVÉ TLAČIDLO NFC POD QR KÓDOM */}
                  <TouchableOpacity 
                    style={{ 
                      marginTop: 20, 
                      padding: 15, 
                      width: '100%', 
                      alignItems: 'center', 
                      backgroundColor: '#111', 
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#0FF' 
                    }}
                    onPress={() => Alert.alert("NFC BEAM", "Hľadám cieľové zariadenie... Priložte mobil.")}
                  >
                    <Text style={[G.textCyber, { color: '#0FF', fontSize: 12 }]}>
                      📡 POSLAŤ CEZ NFC (BEAM)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity 
              style={[G.ircButton, !isVerified && { borderColor: '#444', backgroundColor: '#111' }]} 
              onPress={() => navigation.navigate('IRC')}
            >
              <Text style={G.ircButtonText}>
                {isVerified ? 'VSTÚPIŤ DO BEZPEČNÉHO IRC' : 'OVERIŤ IDENTITU V SMART CONTRACTE'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={{ marginTop: 50, padding: 15, alignItems: 'center' }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[G.textDim, { letterSpacing: 4, fontSize: 12 }]}>
            [ SPÄŤ DO MATRIXU ]
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardScreen;