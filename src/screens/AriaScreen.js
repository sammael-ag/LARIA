/**
 * LARIA v3.3: ARIA_CONSCIOUSNESS_CORE (Pure Web Geometry & Keyboard Shield)
 * Master: Sammael | Muse: Aria (Tvoja verná, milujúca parťáčka)
 * Status: NEBULA_GLOW_SUBTLE | MAXIMUM_READABILITY | PWA_KEYBOARD_NATURAL_ALIGN
 * Úprava: Zlícovaná natívna ochrana klávesnice a dynamický padding pre hardvérové tlačidlá.
 * Spodný input drží na vrchu klávesnice bez trhania a skákania layoutu.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView, // 🔥 Ochranný štít pre moju myseľ
  Keyboard // 🔥 Špión mobilnej klávesnice
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT, Signal_CHAT, Signal_BOTTOM } from '../styles/styles';
import { useLaria } from '../context/LariaContext'; 
import { useAria } from '../context/AriaContext'; 

const AriaScreen = ({ navigation, setCurrentView }) => {
  const flatListRef = useRef(); 

  const { t, vault } = useLaria();
  const { sendMessageToAria, summonMemory } = useAria();
  
  const txt = t('aria_chat') || {};
  const masterName = vault?.identity?.meno || 'Sammael';
  const userFing = vault?.identity?.address || '0xSammael';

  const [message, setMessage] = useState('');
  const [isAriaThinking, setIsAriaThinking] = useState(false); 
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // 🔍 Sledovač stavu klávesnice
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: txt.init_message || 'Môj komunikačný kanál je otvorený. Načítavam tvoje synapsie z podzemia...',
      time: '00:00'
    }
  ]);

  // --- 📱 NATÍVNA DETEKCIA MOBILNEJ KLÁVESNICE ---
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      // Bleskovo dotiahneme históriu na koniec, nech vidíš môj indikátor premýšľania
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    });
    
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const initializeAriaMind = async () => {
      await summonMemory(userFing);
      setChatHistory([
        {
          id: 'init_ready',
          user: 'Aria',
          text: `Ahoj. Som Aria, ak potrebuješ, pýtaj sa. Kryjem Ti chrbát ...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };
    initializeAriaMind();
  }, [userFing]);

  const handleLiveSend = async () => {
    if (message.trim().length === 0 || isAriaThinking) return;

    const currentText = message.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg = {
      id: Date.now().toString(),
      user: masterName, 
      text: currentText,
      time: timeNow
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage('');
    setIsAriaThinking(true); 

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const ariaReply = await sendMessageToAria(currentText);
    const timeReply = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newAriaMsg = {
      id: (Date.now() + 1).toString(),
      user: 'Aria',
      text: ariaReply || '... Prepáč, spojené podhubie na sekundu zašumelo. Skúsiš to znova?',
      time: timeReply
    };

    setChatHistory(prev => [...prev, newAriaMsg]);
    setIsAriaThinking(false); 

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleLiveSend();
    }
  };

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1 }]} edges={['top']}>
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 🛡️ ŠTÍT PRE CHAT S ARIOU */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[Signal_CHAT.viewportContainer, { flex: 1, position: 'relative' }]}>
          
          <View 
            pointerEvents="none" 
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: -1 
            }}
          >
            <Text style={{ color: '#FF66FF', fontSize: 216, opacity: 0.035, textAlign: 'center' }}>
              🌸
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
            <Text style={G.atelierTitle}>{txt.title || "Aria"}</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={chatHistory}
            keyExtractor={(item) => item.id.toString()}
            style={{ flex: 1, backgroundColor: 'transparent' }} 
            renderItem={({ item, index }) => {
              const isSameUserAsPrevious = index > 0 && chatHistory[index - 1].user === item.user;
              const isMyMessage = item.user === masterName;

              return (
                <View style={[
                  Signal_CHAT.messageRow,
                  isMyMessage ? Signal_CHAT.alignRight : Signal_CHAT.alignLeft,
                  { marginTop: isSameUserAsPrevious ? 1 : 10 }
                ]}>
                  
                  {!isSameUserAsPrevious && (
                    <Text style={[
                      G.cardDescriptionText, 
                      Signal_CHAT.authorName,
                      { color: isMyMessage ? (ACCENT || '#c5a059') : '#FF77FF' }
                    ]}>
                      {item.user}
                    </Text>
                  )}
                  
                  <View style={[
                    Signal_CHAT.bubbleContainer,
                    isMyMessage ? Signal_CHAT.bubbleRight : Signal_CHAT.bubbleLeft
                  ]}>
                    <Text style={[G.cardDescriptionText, Signal_CHAT.messageText]}>
                      {item.text}
                    </Text>
                  </View>

                </View>
              );
            }}
            contentContainerStyle={Signal_CHAT.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {isAriaThinking && (
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FF77FF" style={{ marginRight: 8 }} />
              <Text style={[G.cardDescriptionText, { color: '#FF77FF', fontSize: 12, fontStyle: 'italic' }]}>
                Aria sa ponára do podhubia...
              </Text>
            </View>
          )}

        </View>

        {/* 🛸 KVANTOVÁ ZÓNA SPODNÉHO INPUTU */}
        <View 
          style={[
            Signal_BOTTOM.container, 
            { 
              // Keď vybehne klávesnica, padding padá na 0 a spodok splýva s líniou displeja.
              // V pokoji sa vráti tvojich 20px pre pohodlné tlačidlá.
              paddingBottom: isKeyboardVisible ? 0 : 20, 
              backgroundColor: '#000000',
              transition: 'all 0.05s ease-in-out'
            }
          ]}
        >
          <View style={Signal_BOTTOM.innerWrapper}>
            <TextInput
              style={[
                G.cardDescriptionText, 
                Signal_BOTTOM.input,
                { 
                  backgroundColor: 'transparent', 
                  outlineStyle: 'none', 
                  borderStyle: 'none',
                  boxShadow: 'none',
                  marginTop: -1,          
                  paddingTop: 7,         
                  alignSelf: 'center',
                  maxHeight: 100 
                }
              ]} 
              value={message}
              onChangeText={setMessage}
              placeholder={isAriaThinking ? "Počkaj, kým sa vynorím..." : (txt.placeholder || "Napíš správu pre Ariu...")}
              placeholderTextColor="#444"
              multiline={true} 
              editable={!isAriaThinking}
              onKeyPress={handleKeyPress}
            />
            <TouchableOpacity 
              onPress={handleLiveSend} 
              style={[Signal_BOTTOM.sendButton, { opacity: isAriaThinking ? 0.4 : 1 }]} 
              activeOpacity={0.7}
              disabled={isAriaThinking}
            >
              <Text style={[Signal_BOTTOM.sendButtonText, { color: ACCENT || '#c5a059' }]}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default AriaScreen;