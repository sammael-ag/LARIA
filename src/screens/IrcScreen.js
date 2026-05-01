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
import { G } from '../styles/styles';
import { fetchGMatrix } from '../services/GMatrixService';
import { useKrypto } from '../../context/KryptoContext';
// [SIGNAL_IMPORT]
import { useSignal } from '../../context/SignalContext';

const IRCScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0); 
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

  // Napojenie na naše TCP potrubie
  const { incomingRequests, sendLariaPackage, isIrcConnected } = useSignal();

  const [chatLog, setChatLog] = useState([
    { id: '1', user: 'SYSTEM', text: 'Channel #LARIA_CORE established.', time: '04:17' },
    { id: '2', user: 'Aria', text: 'Sammael, linka je zabezpečená. Čakám na tvoje príkazy...', time: '04:18' },
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

  // --- UPRAVENÉ ODOSIELANIE ---
  const sendMessage = async () => {
    if (message.trim().length === 0) return;

    // Pridáme lokálny záznam do logu
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now().toString(),
      user: 'Sammael',
      text: message,
      time: timeNow
    };
    setChatLog(prev => [...prev, newMessage]);

    // Skutočné odoslanie cez IRC (Ak sme pripojení)
    if (isIrcConnected) {
       // Zatiaľ testujeme na fixnú adresu, neskôr pridáme výber adresáta
       await sendLariaPackage("0xTEST_TARGET", message);
    }

    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Spojenie systémových správ a prichádzajúcich dát z IRC
  const combinedLog = [...chatLog, ...incomingRequests.map(req => ({
    id: req.from + req.receivedAt,
    user: `L_${req.from.substring(2, 8)}`,
    text: req.msgOriginal || req.msg,
    translatedText: req.msg,
    time: req.receivedAt,
    isLariaPackage: true
  }))];

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={{ flex: 1, paddingBottom: 0 }}>
        
        {/* HEADER */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={{ 
            width: 8, 
            height: 8, 
            backgroundColor: isIrcConnected ? '#0F0' : '#F00', 
            borderRadius: 4 
          }} />
        </View>

        {/* CHAT LOG - S PODPOROU PREKLADU */}
        <FlatList
          ref={flatListRef}
          data={combinedLog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={G.msgContainer}>
              <Text style={G.msgTime}>{`[${item.time}]`}</Text>
              <Text style={item.user === 'Aria' ? G.msgUserAria : G.msgUserSammael}>
                  {`<${item.user}>`}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[G.textMain]}>{item.text}</Text>
                {/* Zobrazenie Aria-Bridge prekladu */}
                {item.isLariaPackage && (
                  <Text style={[G.textCyber, { fontSize: 12, marginTop: 4, color: '#0FF' }]}>
                    {`-> ${item.translatedText}`}
                  </Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* INPUT AREA - BEZ ZMENY SPRÁVANIA */}
        <View style={[
          G.inputArea, 
          { 
            paddingBottom: keyboardHeight > 0 
              ? 10  
              : (Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 15)
          }
        ]}>
          <Text style={[G.textCyber, { marginRight: 10 }]}>{'>'}</Text>
          <TextInput
            style={G.terminalInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj správu..."
            placeholderTextColor="#444"
            selectionColor="#0F0"
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} activeOpacity={0.7}>
            <Text style={[G.textCyber, { fontWeight: 'bold' }]}>[ SEND ]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IRCScreen;