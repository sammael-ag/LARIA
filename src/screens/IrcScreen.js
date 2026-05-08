/**
 * LARIA IRC SCREEN v9.5
 * STATUS: SECURE CHAT / FING-ONLY SYNC
 * LOGIKA: Lícované na Matchmaker v9.3 a SignalService v9.4.
 * OČISTA: Odstránené 0x, zjednotené kľúče fing_a / fing_b.
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
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { G } from '../styles/styles';
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

  useEffect(() => {
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

  /**
   * [HANDSHAKE] - Potvrdenie kontraktu a uloženie vizitky
   * Lícujeme na Matchmaker v9.3 (fing_a, fing_b, krypt_b)
   */
  const confirmHandshake = async (item) => {
    const handshakeId = item.id;
    const cleanFromFing = item.fromFing.replace('0x', '');
    const myCleanFing = vault.identity.poznamka.replace('0x', '');

    console.log(`[MATRIX] Pečatím spojenie pre FING: ${cleanFromFing}`);
    
    try {
      // 1. ZÁPIS DO MATCHMAKERA (CONFIRM_CONTRACT)
      await SignalService.manageContract('CONFIRM_CONTRACT', { 
        fing_a: cleanFromFing,         // Partner (ten čo začal)
        fing_b: myCleanFing,           // Ty (Sammael)
        krypt_b: vault.identity.krypt  // Tvoj KRYPT pre Final_Block
      });
      
      const viza = item.d; 
      
      // 2. LOKÁLNE ULOŽENIE KONTAKTU
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
        const updated = [...currentContacts, newEntry];
        await AsyncStorage.setItem('laria_contacts', JSON.stringify(updated));
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
      // TU POZOR: Pre testovacie účely môžeš použiť broadcast alebo konkrétny FING
      // sendLariaPackage(cieľový_fing, cieľové_sha, správa)
      await sendLariaPackage("TEST_FING", "TEST_SHA", message); 
    }

    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessageContent = (item) => {
    const showButton = item.isHandshake && !confirmedIds.includes(item.id);

    return (
      <View style={{ flex: 1 }}>
        <Text style={[G.textMain]}>{item.text}</Text>
        
        {showButton && (
          <TouchableOpacity 
            onPress={() => confirmHandshake(item)} 
            activeOpacity={0.7}
            style={{ 
              marginTop: 12, paddingVertical: 10, paddingHorizontal: 15,
              borderWidth: 1, borderColor: '#0FF', borderRadius: 4,
              backgroundColor: 'rgba(0, 255, 255, 0.1)', alignItems: 'center'
            }}
          >
            <Text style={[G.textCyber, { color: '#0FF', fontSize: 13, fontWeight: 'bold' }]}>
               [ PRIJAŤ KONTAKT A PEČAŤ KRYPT ]
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={{ 
            width: 8, height: 8, 
            backgroundColor: isIrcConnected ? '#0F0' : '#F00', 
            borderRadius: 4
          }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={combinedLog}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={G.msgContainer}>
              <Text style={G.msgTime}>{`[${item.time}]`}</Text>
              <Text style={item.user === (vault.identity.meno || 'Sammael') ? G.msgUserSammael : G.msgUserAria}>
                  {`<${item.user}>`}
              </Text>
              {renderMessageContent(item)}
            </View>
          )}
          contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        />

        <View style={[G.inputArea, { paddingBottom: keyboardHeight > 0 ? 10 : Math.max(insets.bottom, 15) }]}>
          <Text style={[G.textCyber, { marginRight: 10 }]}>{'>'}</Text>
          <TextInput
            style={G.terminalInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj príkaz Matrixu..."
            placeholderTextColor="#333"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
            <Text style={[G.textCyber, { fontWeight: 'bold' }]}>[ SEND ]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IRCScreen;