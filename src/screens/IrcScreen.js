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
  const [confirmedIds, setConfirmedIds] = useState([]); // Sledovanie kliknutých tlačidiel
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

  const { incomingRequests, sendLariaPackage, isIrcConnected } = useSignal();
  const { syncIdentity } = useLaria(); 

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

  const confirmHandshake = async (item) => {
    const handshakeId = item.id;
    console.log(`[HANDSHAKE] Oživujem kontrakt: ${item.cid}`);
    
    try {
      await SignalService.manageContract('CONFIRM_CONTRACT', { 
        Contract_ID: item.cid,
        Address_B: item.from, 
        Status_B: "1"
      });
      
      const viza = item.d; 
      const newEntry = {
        id: item.cid || Date.now().toString(),
        name: viza?.n || 'Neznámy Majster',
        tel: viza?.t || '',
        email: viza?.e || '',
        revo: viza?.ib || '', 
        cat: 'Handshake',
        loc: 'IRC Signal',
        pinned: false,
        isVerified: true,
        timestamp: new Date().toISOString()
      };

      const storedJson = await AsyncStorage.getItem('laria_contacts');
      const currentContacts = storedJson ? JSON.parse(storedJson) : [];
      
      if (!currentContacts.find(c => c.id === newEntry.id)) {
        const updated = [...currentContacts, newEntry];
        await AsyncStorage.setItem('laria_contacts', JSON.stringify(updated));
      }

      // TLAČIDLO ZMIZNI: Pridáme ID do zoznamu potvrdených
      setConfirmedIds(prev => [...prev, handshakeId]);

      setChatLog(prev => [...prev, {
        id: `CONF_MSG_${Date.now()}`,
        user: 'SYSTEM',
        text: `Kontakt ${newEntry.name} oživený. Tlačidlo spálené v Matrixe.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err) {
      console.error("Chyba pri oživovaní:", err);
    }
  };

  const sendMessage = async () => {
    if (message.trim().length === 0) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { id: Date.now().toString(), user: 'Sammael', text: message, time: timeNow };
    setChatLog(prev => [...prev, newMessage]);
    if (isIrcConnected) { await sendLariaPackage("0xTEST_TARGET", message); }
    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessageContent = (item) => {
    // Tlačidlo sa zobrazí len ak ide o handshake A ZÁROVEŇ ešte nebolo potvrdené
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
              backgroundColor: 'rgba(0, 255, 255, 0.05)', alignItems: 'center'
            }}
          >
            <Text style={[G.textCyber, { color: '#0FF', fontSize: 13, fontWeight: 'bold' }]}>
               [ PRIJAŤ KONTAKT A VIZITKU ]
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

  const combinedLog = [...chatLog, ...incomingRequests.map(req => ({
    id: req.cid || (req.from + req.receivedAt),
    user: `L_${req.from.substring(2, 8)}`,
    text: req.msgOriginal || req.msg,
    translatedText: req.msg,
    time: req.receivedAt,
    isLariaPackage: true,
    isHandshake: req.isHandshake,
    cid: req.cid,
    from: req.from,
    d: req.d 
  }))];

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={{ width: 8, height: 8, backgroundColor: isIrcConnected ? '#0F0' : '#F00', borderRadius: 4 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={combinedLog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={G.msgContainer}>
              <Text style={G.msgTime}>{`[${item.time}]`}</Text>
              <Text style={item.user === 'Sammael' ? G.msgUserSammael : G.msgUserAria}>
                  {`<${item.user}>`}
              </Text>
              {renderMessageContent(item)}
            </View>
          )}
          contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[G.inputArea, { paddingBottom: keyboardHeight > 0 ? 10 : Math.max(insets.bottom, 15) }]}>
          <Text style={[G.textCyber, { marginRight: 10 }]}>{'>'}</Text>
          <TextInput
            style={G.terminalInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj správu..."
            placeholderTextColor="#444"
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Text style={[G.textCyber, { fontWeight: 'bold' }]}>[ SEND ]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IRCScreen;