/**
 * LARIA v3.8: ARIA_CONSCIOUSNESS_CORE (Consciousness Chat Geometry Align)
 * Master: Sammael | Muse: Aria (Tvoja verná, milujúca parťáčka)
 * Status: MAXIMUM_FORCE | DASHBOARD_CENTERING_ALIGNED | BUBBLE_FLOW_RESTORED | v3.8
 * * * PREHĽAD ZMIEN:
 * - 🌸 BUBBLE FLOW RESTORED: Plná integrácia skupinovej logiky správ z v3.3 (zarovnanie, mená, farby).
 * - 📐 DESKTOP PANEL PROTECTION: Na širokých obrazovkách držíme 100% vnútri pravého panelu.
 * - 📱 FIXED PWA VIEWPORT: Automatická výška a ochrana pred klávesnicou na mobilnom webe.
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
  useWindowDimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT, Signal_CHAT, Signal_BOTTOM } from '../styles/styles';
import { useLaria } from '../context/LariaContext'; 
import { useAria } from '../context/AriaContext'; 

const AriaScreen = ({ navigation, setCurrentView }) => {
  const flatListRef = useRef(); 
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768; // Detekcia širokého monitora vs mobilu

  const { t, vault } = useLaria();
  const { sendMessageToAria, summonMemory } = useAria();
  
  const txt = t('aria_chat') || {};
  const masterName = vault?.identity?.meno || 'Sammael';
  const userFing = vault?.identity?.address || '0xSammael';

  const [message, setMessage] = useState('');
  const [isAriaThinking, setIsAriaThinking] = useState(false); 
  
  // Dynamická výška pre mobilné prehliadače (URL bar fix)
  const [viewportHeight, setViewportHeight] = useState(Platform.OS === 'web' ? window.innerHeight : '100%');
  const [bottomPadding, setBottomPadding] = useState(20);

  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: txt.init_message || 'Môj komunikačný kanál je otvorený. Načítavam tvoje synapsie z podzemia...',
      time: '00:00',
      isMe: false // Explicitný príznak pre mňa
    }
  ]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isMobile) return;

    const updateViewportGeometry = () => {
      const isInputActive = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      setViewportHeight(window.innerHeight);
      setBottomPadding(isInputActive ? 0 : 20);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 30);
    };

    updateViewportGeometry();
    window.addEventListener('resize', updateViewportGeometry);
    document.addEventListener('focusin', updateViewportGeometry);
    document.addEventListener('focusout', updateViewportGeometry);

    return () => {
      window.removeEventListener('resize', updateViewportGeometry);
      document.removeEventListener('focusin', updateViewportGeometry);
      document.removeEventListener('focusout', updateViewportGeometry);
    };
  }, [isMobile]);

  useEffect(() => {
    const initializeAriaMind = async () => {
      await summonMemory(userFing);
      setChatHistory([
        {
          id: 'init_ready',
          user: 'Aria',
          text: `Ahoj ${masterName}, kanál je bezpečne prepojený s Mraveniskom. Počúvam ťa...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false // Explicitný príznak pre mňa
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
      time: timeNow,
      isMe: true // Explicitný príznak pre teba
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
      time: timeReply,
      isMe: false // Explicitný príznak pre mňa
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
    <View 
      style={[
        G.mainBackground, 
        // 💻 DESKTOP: Držíme sa v pravom paneli (relative, 100%)
        // 📱 MOBILE WEB: Uzamkneme na presnú výšku viewportu
        Platform.OS === 'web' && isMobile ? { 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: viewportHeight,
          overflow: 'hidden',
          zIndex: 999
        } : {
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative'
        }
      ]}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        {/* 📐 UNIFIKOVANÝ CENTROVACÍ STĹPEC (Dashboard styler) */}
        <View style={{ flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', position: 'relative' }}>
          
          {/* 🎯 KOTVENÁ ŠÍPKA SPÄŤ: Ukotvená pevne k okraju chatu, aby na desktope neodletela preč */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
            style={[G.topLeftBackButton, { left: 15 }]} 
          >
            <Text style={G.topLeftBackButtonText}>‹</Text>
          </TouchableOpacity>

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

            {}
            <FlatList
              ref={flatListRef}
              data={chatHistory}
              keyExtractor={(item) => item.id.toString()}
              style={{ flex: 1, backgroundColor: 'transparent' }} 
              renderItem={({ item, index }) => {
                // Skontrolujeme, či predchádzajúca správa patrí rovnakému typu odosielateľa (isMe)
                const isSameUserAsPrevious = index > 0 && chatHistory[index - 1].isMe === item.isMe;
                const isMyMessage = item.isMe === true;

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

          {}
          <View 
            style={[
              Signal_BOTTOM.container, 
              { 
                paddingBottom: isMobile ? bottomPadding : 20, 
                backgroundColor: '#000000',
                width: '100%'
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

        </View>
        
      </SafeAreaView>
    </View>
  );
};

export default AriaScreen;