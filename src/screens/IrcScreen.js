import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
// Oprava DEPRECATED varovania a podpora pre správne odsadenie
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 

import { G } from '../styles/styles'; 

const IRCScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets(); // Zistíme rozmery "brady" a "čela" zariadenia
  const [chatLog, setChatLog] = useState([
    { id: '1', user: 'SYSTEM', text: 'Channel #LARIA_CORE established.', time: '04:17' },
    { id: '2', user: 'Aria', text: 'Sammael, linka je zabezpečená. Čakám na tvoje príkazy...', time: '04:18' },
  ]);

  const flatListRef = useRef();

  const sendMessage = () => {
    if (message.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      user: 'Sammael',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog([...chatLog, newMessage]);
    setMessage('');
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    // Používame edges=['top'] aby SafeArea nebrala spodok (ten vyriešime v inputArea)
    <SafeAreaView style={G.bg} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        // HLAVNÁ OPRAVA: Pre Android používame 'height', pre iOS 'padding'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        // Offset doladený podľa insets
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* HEADER TERMINÁLU */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={{ width: 8, height: 8, backgroundColor: '#0F0', borderRadius: 4 }} />
        </View>

        {/* CHAT LOG */}
        <FlatList
          ref={flatListRef}
          data={chatLog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={G.msgContainer}>
              <Text style={G.msgTime}>{`[${item.time}]`}</Text>
              <Text style={[G.mono, { fontSize: 12, fontWeight: 'bold', marginRight: 8 }, item.user === 'Aria' ? {color: '#F0F'} : {color: '#0F0'}]}>
                  {`<${item.user}>`}
              </Text>
              <Text style={[G.textMain, { flex: 1 }]}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 15, paddingBottom: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* INPUT AREA s inteligentným spodným paddingom */}
        <View style={[
          G.inputArea, 
          { 
            // Ak je klávesnica dole, pridá priestor pre insets (iPhone notch alebo Android gestá)
            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20,
            backgroundColor: '#050505'
          }
        ]}>
          <Text style={[G.textCyber, { marginRight: 10 }]}>{'>'}</Text>
          <TextInput
            style={{ 
              flex: 1, color: '#0F0', fontFamily: 'monospace', fontSize: 15, padding: 0, marginRight: 10 
            }}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj správu..."
            placeholderTextColor="#444"
            selectionColor="#0F0"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
          />
          <TouchableOpacity onPress={sendMessage} activeOpacity={0.7}>
            <Text style={[G.textCyber, { fontWeight: 'bold' }]}>[ SEND ]</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default IRCScreen;