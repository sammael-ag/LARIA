import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';

const IRCScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
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
    <SafeAreaView style={UI.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        // KLÚČOVÁ ZMENA: Androidu necháme voľnosť (null), iOS povieme presne (padding)
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{ flex: 1 }}
        // Offset doladíme podľa systému
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER */}
        <View style={UI.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={UI.backBtn}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={UI.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={UI.statusDot} />
        </View>

        {/* CHAT LOG */}
        <FlatList
          ref={flatListRef}
          data={chatLog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={UI.msgContainer}>
              <Text style={UI.msgTime}>[{item.time}]</Text>
              <Text style={[UI.msgUser, item.user === 'Aria' ? {color: '#F0F'} : {color: '#0F0'}]}>
                    {"<"}{item.user}{">"}
              </Text>
              <Text style={UI.msgText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={UI.chatPadding}
          // Toto zabezpečí, že po kliknutí do inputu sa zoznam neodreže
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* INPUT AREA */}
        <View style={UI.inputArea}>
          <Text style={UI.prompt}>{'>'}</Text>
          <TextInput
            style={UI.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Zadaj správu..."
            placeholderTextColor="#222"
            selectionColor="#0F0"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
          />
          <TouchableOpacity onPress={sendMessage} activeOpacity={0.7}>
            <Text style={UI.sendBtn}>[ SEND ]</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const UI = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#111',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 15
  },
  headerTitle: { color: '#0F0', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 },
  backBtn: { color: '#444', fontFamily: 'monospace', fontSize: 12 },
  statusDot: { width: 8, height: 8, backgroundColor: '#0F0', borderRadius: 4 },
  chatPadding: { padding: 15, paddingBottom: 10 },
  msgContainer: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  msgTime: { color: '#333', fontFamily: 'monospace', fontSize: 10, marginRight: 8 },
  msgUser: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  msgText: { color: '#AAA', fontFamily: 'monospace', fontSize: 12, flex: 1 },
  inputArea: { 
    flexDirection: 'row', 
    paddingHorizontal: 15, 
    paddingVertical: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#111', 
    alignItems: 'center',
    backgroundColor: '#050505',
    // Spodný padding riešime len pre moderné iPhony
    paddingBottom: Platform.OS === 'ios' ? 35 : 15, 
  },
  input: { 
    flex: 1, 
    color: '#0F0', 
    fontFamily: 'monospace', 
    fontSize: 15, 
    padding: 0,
    marginRight: 10 
  },
  prompt: { color: '#0F0', fontFamily: 'monospace', marginRight: 10 },
  sendBtn: { color: '#0F0', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' }
});

export default IRCScreen;