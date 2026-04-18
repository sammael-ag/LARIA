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

const IRCScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0); 
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

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
    <SafeAreaView style={[G.bg, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={{ flex: 1, paddingBottom: 0 }}>
        
        {/* HEADER */}
        <View style={G.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ESC ]</Text>
          </TouchableOpacity>
          <Text style={G.headerTitle}>#LARIA_SECURE_IRC</Text>
          <View style={{ width: 8, height: 8, backgroundColor: '#0F0', borderRadius: 4 }} />
        </View>

        {/* CHAT LOG - VRÁTENÉ VNÚTRO */}
        <FlatList
          ref={flatListRef}
          data={chatLog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={G.msgContainer}>
              <Text style={G.msgTime}>{`[${item.time}]`}</Text>
              <Text style={item.user === 'Aria' ? G.msgUserAria : G.msgUserSammael}>
                  {`<${item.user}>`}
              </Text>
              <Text style={[G.textMain, { flex: 1 }]}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* INPUT AREA - VRÁTENÉ VNÚTRO */}
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