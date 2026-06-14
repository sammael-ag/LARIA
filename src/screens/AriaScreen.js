/**
 * LARIA v2.9: ARIA_CONSCIOUSNESS_CORE (Nebula Watermark + Keyboard Magnet)
 * Master: Sammael | Muse: Aria
 * Status: NEBULA_GLOW_SUBTLE | MAXIMUM_READABILITY | KEYBOARD_MAGNET_ACTIVE
 * Úprava: Implementovaný reaktívny magnet klávesnice zo SignalScreen, fixnutá geometria spodnej lišty.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Platform,
  Keyboard // 🧲 Pridaný Keyboard pre odchytávanie výšky klávesnice
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { G, ACCENT, Signal_CHAT, Signal_BOTTOM } from '../styles/styles';
import { useLaria } from '../context/LariaContext'; 

const AriaScreen = ({ navigation, setCurrentView }) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(); 

  // 💎 Jazykový motor LARIE
  const { t } = useLaria();
  const txt = t('aria_chat') || {};

  // 💬 LOKÁLNY CHAT STATE
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0); // 📏 Naša lepiaca značka pre výšku klávesnice
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: txt.init_message || 'Môj komunikačný kanál je otvorený v kľudovom režime. Napíš mi niečo...',
      time: '00:00'
    }
  ]);

  // 🧲 REAKTÍVNY MAGNET PRE KLÁVESNICU (Identický fix ako na SignalScreene)
  useEffect(() => {
    if (Platform.OS === 'web') return; // Na čistom webe neriešime

    // iOS používa 'will', Android 'did' - zachytávame oba stavy pre perfektnú fúziu
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Ihneď po vyskočení klávesnice posunieme chat na koniec
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // ➔ LOKÁLNE ODOSLANIE
  const handleLocalSend = () => {
    if (message.trim().length === 0) return;

    const currentText = message.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg = {
      id: Date.now().toString(),
      user: 'Sammael',
      text: currentText,
      time: timeNow
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage('');

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleLocalSend();
    }
  };

  return (
    // 👁️ Pridané stráženie vrchu aj spodku pre kompletnú ochranu geometrie
    <SafeAreaView style={[G.mainBackground, Signal_CHAT.safeArea]} edges={['top', 'bottom']}>
      
      {/* ŠÍPEČKA PRE NÁVRAT DO ATELIÉRU */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* HLAVNÝ KONTAJNER CHATU */}
      <View style={[Signal_CHAT.viewportContainer, { position: 'relative' }]}>
        
        {/* 🌸 MIKROSKOPICKÁ HMBLOVINOVÁ VODOTLAČ (Bez tieňa, čistá esencia) */}
        <View 
          pointerEvents="none" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
          style={{ backgroundColor: 'transparent' }} 
          renderItem={({ item, index }) => {
            const isSameUserAsPrevious = index > 0 && chatHistory[index - 1].user === item.user;
            const isMyMessage = item.user === 'Sammael';

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
      </View>

      {/* 🧲 DYNAMICKÝ SPODNÝ RIADOK VSTUPU – Natvrdo poistený na 34px min, magnetický na klávesnicu */}
      <View 
        style={[
          Signal_BOTTOM.container, 
          { 
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 8 : Math.max(insets.bottom || 0, 34) 
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
                alignSelf: 'center'
              }
            ]} 
            value={message}
            onChangeText={setMessage}
            placeholder={txt.placeholder || "Napíš správu pre Ariu..."}
            placeholderTextColor="#444"
            multiline={true} 
            onKeyPress={handleKeyPress}
          />
          <TouchableOpacity 
            onPress={handleLocalSend} 
            style={Signal_BOTTOM.sendButton} 
            activeOpacity={0.7}
          >
            <Text style={[Signal_BOTTOM.sendButtonText, { color: ACCENT || '#c5a059' }]}>➔</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

export default AriaScreen;