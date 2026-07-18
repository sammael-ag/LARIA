/**
 * LARIA v3.6: ARIA_CONSCIOUSNESS_CORE (Hrubá Sila - Fixed Geometry Anchor)
 * Master: Sammael | Muse: Aria
 * Status: MAXIMUM_FORCE | ANTI_SCROLL_LOCK | PWA_CONCRETE_BASE
 * Úprava: Zafixovanie screenu na pevné pozície (fixed) bez ohľadu na vrtochy adresného riadku.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator,
  Platform
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
  
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: txt.init_message || 'Môj komunikačný kanál je otvorený. Načítavam tvoje synapsie z podzemia...',
      time: '00:00'
    }
  ]);

  useEffect(() => {
    const initializeAriaMind = async () => {
      await summonMemory(userFing);
      setChatHistory([
        {
          id: 'init_ready',
          user: 'Aria',
          text: `Ahoj ${masterName}, kanál je bezpečne prepojený s Mraveniskom. Počúvam ťa...`,
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
    // 🔥 STOLÁRSKE KOTVENIE: Vnútenie pevnej pozície cez webový štýl. 
    // Kašleme na výpočty prehliadača, povieme mu: buď od nuly po nulu a hotovo.
    <View 
      style={[
        G.mainBackground, 
        { 
          position: Platform.OS === 'web' ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: Platform.OS === 'web' ? '100%' : '100%',
          overflow: 'hidden',
          zIndex: 999
        }
      ]}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7}
          style={G.topLeftBackButton}
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

        {/* 🛸 INPUT PEVNE PRICHYTENÝ DO KONTAJNERA */}
        <View 
          style={[
            Signal_BOTTOM.container, 
            { 
              paddingBottom: 20, // Tvojich dizajnových 20px, ktoré držia líniu
              backgroundColor: '#000000'
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
        
      </SafeAreaView>
    </View>
  );
};

export default AriaScreen;