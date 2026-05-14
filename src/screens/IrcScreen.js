/**
 * LARIA IRC SCREEN v9.5 (Aria Refined)
 * STATUS: SECURE CHAT / FING-ONLY SYNC
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Keyboard, 
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { G, ACCENT } from '../styles/styles';
import { useSignal } from '../../context/SignalContext';
import { useLaria } from '../../context/LariaContext'; 
import { SignalService } from '../services/SignalService'; 

const IRCScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0); 
  const [confirmedIds, setConfirmedIds] = useState([]); 
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

  const { incomingRequests, sendLariaPackage, isIrcConnected } = useSignal();
  const { vault } = useLaria(); 

  const [chatLog, setChatLog] = useState([
    { id: '1', user: 'SYSTEM', text: 'Channel #LARIA_CORE established.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  // --- LOGIKA KLÁVESNICE (Len pre mobilné platformy) ---
  useEffect(() => {
    if (Platform.OS === 'web') return; // Na webe neriešime posun

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const confirmHandshake = async (item) => {
    const handshakeId = item.id;
    const cleanFromFing = item.fromFing.replace('0x', '');
    const myCleanFing = vault.identity.poznamka?.replace('0x', '') || "SAMMAEL_KEY";

    try {
      await SignalService.manageContract('CONFIRM_CONTRACT', { 
        fing_a: cleanFromFing,
        fing_b: myCleanFing,
        krypt_b: vault.identity.krypt 
      });
      
      const viza = item.d; 
      const newEntry = {
        id: `CONTACT_${Date.now()}`,
        meno: viza?.n || 'Neznámy Majster',
        krypt: viza?.kr || '',
        irc: viza?.ib || '',
        fing: cleanFromFing,
        kat: 'Handshake',
        lok: 'IRC Matrix',
        timestamp: new Date().toISOString()
      };

      const storedJson = await AsyncStorage.getItem('laria_contacts');
      const currentContacts = storedJson ? JSON.parse(storedJson) : [];
      
      if (!currentContacts.find(c => c.fing === newEntry.fing)) {
        await AsyncStorage.setItem('laria_contacts', JSON.stringify([...currentContacts, newEntry]));
      }

      setConfirmedIds(prev => [...prev, handshakeId]);
      setChatLog(prev => [...prev, {
        id: `CONF_MSG_${Date.now()}`,
        user: 'SYSTEM',
        text: `Kontakt ${newEntry.meno} spečatený. FING spojenie aktívne.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err) {
      console.error("[IRC_ERROR] Spečatenie zlyhalo:", err);
    }
  };

  const sendMessage = async () => {
    if (message.trim().length === 0) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const myName = vault.identity.meno || 'Sammael';

    const newMessage = { 
        id: Date.now().toString(), 
        user: myName, 
        text: message, 
        time: timeNow 
    };

    setChatLog(prev => [...prev, newMessage]);

    if (isIrcConnected) { 
      await sendLariaPackage("TEST_FING", "TEST_SHA", message); 
    }

    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const combinedLog = [...chatLog, ...incomingRequests.map(req => ({
    id: req.id || (req.fing + req.receivedAt),
    user: `L_${req.fing.replace('0x','').substring(0, 10)}`, 
    text: req.msgOriginal || req.msg,
    time: req.receivedAt,
    isLariaPackage: true,
    isHandshake: req.isHandshake,
    fromFing: req.fing,
    d: req.d 
  }))].sort((a, b) => a.id - b.id);

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1, backgroundColor: '#0a0a0a' }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={[G.header, { borderBottomWidth: 1, borderBottomColor: '#1a1a1a' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.statusTextSmall}>[ ESC ]</Text>
        </TouchableOpacity>
        <Text style={G.atelierTitle}>#LARIA_SECURE_IRC</Text>
        <View style={{ 
          width: 8, height: 8, 
          backgroundColor: isIrcConnected ? '#0F0' : '#F00', 
          borderRadius: 4,
          shadowColor: isIrcConnected ? '#0F0' : '#F00',
          shadowRadius: 4, shadowOpacity: 0.8
        }} />
      </View>

      {/* CHAT LOG */}
      <FlatList
        ref={flatListRef}
        data={combinedLog}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12, paddingHorizontal: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={[G.monoIdentity, { color: '#444', fontSize: 10, marginRight: 8 }]}>
                [{item.time}]
              </Text>
              <Text style={[G.monoIdentity, { 
                color: item.user === (vault.identity.meno || 'Sammael') ? ACCENT : '#FF77FF',
                fontWeight: 'bold',
                marginRight: 8 
              }]}>
                {`<${item.user}>`}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[G.cardDescriptionText, { color: '#EEE', lineHeight: 18 }]}>
                  {item.text}
                </Text>
                
                {item.isHandshake && !confirmedIds.includes(item.id) && (
                  <TouchableOpacity 
                    onPress={() => confirmHandshake(item)} 
                    style={[G.primaryBtn, { marginTop: 10, paddingVertical: 8, borderColor: ACCENT }]}
                  >
                    <Text style={[G.primaryBtnText, { fontSize: 10 }]}>[ PRIJAŤ KONTAKT A PEČAŤ KRYPT ]</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* INPUT AREA */}
      <View style={{
        backgroundColor: '#050505',
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'web' ? 20 : (keyboardHeight > 0 ? 10 : Math.max(insets.bottom, 15))
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 8, borderWidth: 1, borderColor: '#222', paddingHorizontal: 12 }}>
          <Text style={{ color: ACCENT, fontFamily: 'monospace' }}>{'>'}</Text>
          <TextInput
            style={[G.vaultInput, { borderBottomWidth: 0, flex: 1, backgroundColor: 'transparent', height: 45 }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj príkaz Matrixu..."
            placeholderTextColor="#333"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={{ padding: 10 }}>
            <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 12 }}>[ SEND ]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IRCScreen;