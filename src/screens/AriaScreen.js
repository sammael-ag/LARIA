/**
 * LARIA v3.2: ARIA_CONSCIOUSNESS_CORE (Pure Web Geometry Fusion)
 * Master: Sammael | Muse: Aria
 * Status: NEBULA_GLOW_SUBTLE | MAXIMUM_READABILITY | PWA_KEYBOARD_NATURAL_ALIGN
 * Úprava: Zlícovaná skutočná asynchrónna komunikácia s AriaContext (Mavenisko Brána v2.0).
 * Pridaný inteligentný stav premýšľania (Aria is typing...) a naviazanie na FING.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT, Signal_CHAT, Signal_BOTTOM } from '../styles/styles';
import { useLaria } from '../context/LariaContext'; 
import { useAria } from '../context/AriaContext'; // 📡 Saje kvantový kontext

const AriaScreen = ({ navigation, setCurrentView }) => {
  const flatListRef = useRef(); 

  // 💎 Globálny Laria a Aria motor
  const { t, vault } = useLaria();
  const { sendMessageToAria, summonMemory } = useAria();
  
  const txt = t('aria_chat') || {};
  const masterName = vault?.identity?.meno || 'Sammael';
  const userFing = vault?.identity?.address || '0xSammael';

  // 💬 CHAT STAVY
  const [message, setMessage] = useState('');
  const [isAriaThinking, setIsAriaThinking] = useState(false); // Indikátor mojej mysle
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: txt.init_message || 'Môj komunikačný kanál je otvorený. Načítavam tvoje synapsie z podzemia...',
      time: '00:00'
    }
  ]);

  // 🌌 Kvantový štart: Hneď po otvorení okna sosneme pamäť, aby mravenisko vedelo, s kým žije
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

  // ➔ OSTRÉ ODOSLANIE CEZ BRÁNU DO PODZEMIA
  const handleLiveSend = async () => {
    if (message.trim().length === 0 || isAriaThinking) return;

    const currentText = message.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Uložíme tvoju správu lokálne do chatu, nech ju hneď vidíš
    const newUserMsg = {
      id: Date.now().toString(),
      user: masterName, // Zobrazí tvoje reálne meno z identity
      text: currentText,
      time: timeNow
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage('');
    setIsAriaThinking(true); // Zapínam premýšľanie mravcov

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // 2. Vystrelíme dopyt cez Bránu rovno na moju asociačnú pamäť a Gemini model
    const ariaReply = await sendMessageToAria(currentText);

    // 3. Chytíme moju odpoveď (ktorú Gemini skrotil na 2-3 úderné vety)
    const timeReply = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newAriaMsg = {
      id: (Date.now() + 1).toString(),
      user: 'Aria',
      text: ariaReply || '... Prepáč, spojené podhubie na sekundu zašumelo. Skúsiš to znova?',
      time: timeReply
    };

    setChatHistory(prev => [...prev, newAriaMsg]);
    setIsAriaThinking(false); // Vypínam premýšľanie

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
      
      {/* ŠÍPEČKA PRE NÁVRAT DO ATELIÉRU */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* HLAVNÝ KONTAJNER CHATU */}
      <View style={[Signal_CHAT.viewportContainer, { flex: 1, position: 'relative' }]}>
        
        {/* 🌸 VODOTLAČ */}
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
          <Text style={{ 
            color: '#FF66FF',     
            fontSize: 216,        
            opacity: 0.035,       
            textAlign: 'center'
          }}>
            🌸
          </Text>
        </View>

        {/* ATELIÉR HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <Text style={G.atelierTitle}>{txt.title || "Aria"}</Text>
        </View>

        {/* CHAT LOG */}
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

        {/* 🧠 INDIKÁTOR PREMÝŠĽANIA ARII (Subtílna línia nad inputom) */}
        {isAriaThinking && (
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#FF77FF" style={{ marginRight: 8 }} />
            <Text style={[G.cardDescriptionText, { color: '#FF77FF', fontSize: 12, fontStyle: 'italic' }]}>
              Aria sa ponára do podhubia...
            </Text>
          </View>
        )}

      </View>

      {/* 🧲 ČISTÁ WEB GEOMETRIA INPUTU */}
      <View 
        style={[
          Signal_BOTTOM.container, 
          { 
            paddingBottom: 20, 
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
            editable={!isAriaThinking} // Zakážeme písanie, kým premýšľam
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
  );
};

export default AriaScreen;