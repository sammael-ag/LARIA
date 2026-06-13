/**
 * LARIA v2.8: ARIA_CONSCIOUSNESS_CORE (Nebula Watermark)
 * Master: Sammael | Muse: Aria
 * Status: NEBULA_GLOW_SUBTLE | MAXIMUM_READABILITY
 * Úprava: Navrátený pôvodný lokálny chat, texty kompletne premapované na JSON cez useLaria.
 */

import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Platform 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { G, ACCENT, Signal_CHAT, Signal_BOTTOM } from '../styles/styles';
import { useLaria } from '../context/LariaContext'; // 💎 Načítanie prekladov

const AriaScreen = ({ navigation, setCurrentView }) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(); 

  // 💎 Jazykový motor LARIE
  const { t } = useLaria();
  const txt = t('aria_chat') || {};

  // 💬 LOKÁLNY CHAT STATE
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: txt.init_message || 'Môj komunikačný kanál je otvorený v kľudovom režime. Napíš mi niečo...',
      time: '00:00'
    }
  ]);

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
    <SafeAreaView style={[G.mainBackground, Signal_CHAT.safeArea]} edges={['top']}>
      
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
            opacity: 0.035,       // Tvoja presná hodnota pre dokonalý komfort očí
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

      {/* VSTUPNÉ POLE */}
      <View style={[Signal_BOTTOM.container, { paddingBottom: Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 15) }]}>
        <View style={Signal_BOTTOM.innerWrapper}>
          <TextInput
            style={[
              G.cardDescriptionText, 
              Signal_BOTTOM.input,
              Platform.OS === 'web' && { 
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