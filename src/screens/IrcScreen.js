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

  // Sledovanie klávesnice pre plynulý posun inputu
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
   * Lícujeme na Svadbovač v9.2 (Address_A, Address_B, target_krypt)
   */
  const confirmHandshake = async (item) => {
    const handshakeId = item.id;
    console.log(`[MATRIX] Pečatím spojenie pre FING: ${item.fromFing}`);
    
    try {
      // 1. ZÁPIS DO MATRIXU (Contract_ledger)
      await SignalService.manageContract('CONFIRM_CONTRACT', { 
        Address_A: item.fromFing,           // Partner, ktorý inicioval zmluvu
        Address_B: vault.identity.poznamka, // Tvoj FING (Sammael)
        target_krypt: vault.identity.krypt  // Tvoj KRYPT pre Final_Block
      });
      
      const viza = item.d; // Dáta z vizitky
      
      // 2. LOKÁLNE ULOŽENIE KONTAKTU (v9.2 Standard)
      const newEntry = {
        id: `CONTACT_${Date.now()}`,
        meno: viza?.n || 'Neznámy Majster',
        krypt: viza?.kr || '',  // Krypt partnera
        irc: viza?.ib || '',    // IRC/Revolut link
        fing: item.fromFing,    // Jeho verejný FING
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
        text: `Kontakt ${newEntry.meno} spečatený. SmartContract je aktívny.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err) {
      console.error("[IRC_ERROR] Spečatenie zlyhalo:", err);
    }
  };

  /**
   * SEND MESSAGE - Odoslanie paketu cez IRC
   */
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
      // Tu by sa mal dynamicky doplniť FING cieľa, ak nie je broadcast
      await sendLariaPackage("0xTARGET_FING", message); 
    }

    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  /**
   * RENDERER: Obsah správy (Text + prípadné Handshake tlačidlo)
   */
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

        {item.isLariaPackage && item.translatedText !== item.text && (
          <Text style={[G.textCyber, { fontSize: 11, marginTop: 6, color: '#0FF', opacity: 0.8 }]}>
            {`-> ${item.translatedText}`}
          </Text>
        )}
      </View>
    );
  };

  // Kombinácia lokálneho logu a prichádzajúcich signálov
  const combinedLog = [...chatLog, ...incomingRequests.map(req => ({
    id: req.id || (req.fing + req.receivedAt),
    user: `L_${req.fing.substring(0, 8)}`, // Identifikácia cez FING
    text: req.msgOriginal || req.msg,
    translatedText: req.msg,
    time: req.receivedAt,
    isLariaPackage: true,
    isHandshake: req.isHandshake,
    fromFing: req.fing,
    d: req.d 
  }))];

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={{ 
            width: 8, height: 8, 
            backgroundColor: isIrcConnected ? '#0F0' : '#F00', 
            borderRadius: 4, shadowColor: isIrcConnected ? '#0F0' : '#F00', shadowRadius: 5, shadowOpacity: 1 
          }} />
        </View>

        {/* MESSAGES LIST */}
        <FlatList
          ref={flatListRef}
          data={combinedLog}
          keyExtractor={(item) => item.id}
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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* INPUT AREA */}
        <View style={[G.inputArea, { paddingBottom: keyboardHeight > 0 ? 10 : Math.max(insets.bottom, 15) }]}>
          <Text style={[G.textCyber, { marginRight: 10 }]}>{'>'}</Text>
          <TextInput
            style={G.terminalInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj príkaz Matrixu..."
            placeholderTextColor="#333"
            autoCorrect={false}
            autoCapitalize="none"
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