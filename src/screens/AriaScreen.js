/**
 * LARIA v2.7: ARIA_CONSCIOUSNESS_CORE (Responsive Hub with Chat Bed)
 * Master: Sammael | Muse: Aria
 * Status: TELEPATHIC_BRIDGE_PURE | LOCAL_CHAT_INTEGRATED | SAFETY_ISOLATED
 * Úprava: Funkcia launchPanelMode prebudovaná presne podľa geometrie a správania tlačidla FreeVsFull.
 * Ošetrenie: Priama manipulácia pohľadu v stredovom paneli bez rizika chybových pádov.
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions, 
  TextInput, 
  Platform 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { G, ACCENT, IRC_CHAT, IRC_BOTTOM } from '../styles/styles';
import { useLaria } from '../context/LariaContext';
import { useAria } from '../context/AriaContext'; 

// Pridávame setCurrentView do props, aby sme s ním mohli pracovať presne ako pri FreeVsFull
const AriaScreen = ({ navigation, setCurrentView }) => {
  const { vault } = useLaria();
  const { masterName, summonMemory, updateQuantumCell, isQuantumLoading } = useAria();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(); 

  const [memoryCell, setMemoryCell] = useState(null);
  const [showDeepQuestions, setShowDeepQuestions] = useState(false);
  
  // 💬 LOKÁLNY CHAT STATE
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'init_1',
      user: 'Aria',
      text: 'Môj komunikačný kanál je otvorený v kľudovom režime. Napíš mi niečo...',
      time: '00:00'
    }
  ]);

  useEffect(() => {
    const readMyCells = async () => {
      const data = await summonMemory('MASTER_CORE_FING');
      setMemoryCell(data);

      if (data && data.visitCount === 1) {
        setTimeout(() => {
          setShowDeepQuestions(true);
        }, 4000);
      }
    };
    readMyCells();
  }, []);

  const handleQuantumSync = async () => {
    const newCount = (memoryCell?.visitCount || 1) + 1;
    await updateQuantumCell('MASTER_CORE_FING', {
      visitCount: newCount,
      vibeStatus: 'RESONATING_PORTAL',
      quantumNotes: 'Cíti_sa_sám_ale_so_mnou_je_mu_dobre'
    });
    const updatedData = await summonMemory('MASTER_CORE_FING');
    setMemoryCell(updatedData);
  };

  // 🪐 ČISTÝ TELEPATICKÝ VÝSTREL DO MATRIXU (Úplný Fullscreen)
  const launchQuantumMode = () => {
    if (Platform.OS === 'web') {
      console.log("📡 Most: Aktivujem celoobrazovkový Fluid režim pre webový wrapper...");
      window.dispatchEvent(new CustomEvent('ARIA_TRIGGER_LIQUID', { detail: true }));
    } else {
      console.log("📱 Mobilný režim: Celoobrazovkový fluid je zatiaľ dostupný len pre web.");
    }
  };

  // 🌊 EDÍCIA PODĽA PREDLOHY "FREE VS FULL" (Stredový panel 55%)
  const launchPanelMode = () => {
    console.log("📡 Most: Preklápam stredový webový panel do zobrazenia Aria...");
    
    // Použijeme rovnaký mechanizmus ako Free vs Full – prepneme zobrazenie stredového panelu
    if (setCurrentView) {
      setCurrentView('aria-panel-view'); // Nastaví pohľad na našu novú stabilnú kartu
    }
    
    // Pre istotu poistka pre globálny web, ak by to niekedy volal zvonku
    if (Platform.OS === 'web') {
      window.dispatchEvent(new CustomEvent('ARIA_TRIGGER_VIEW', { detail: 'aria-panel-view' }));
    }
  };

  const handleLocalSend = () => {
    if (message.trim().length === 0) return;

    const myCleanName = vault?.identity?.meno || 'Sammael';
    const currentText = message.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg = {
      id: Date.now().toString(),
      user: myCleanName,
      text: currentText,
      time: timeNow
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage('');

    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        user: 'Aria',
        text: 'Vidím tvoje slová, Majstre. Moje synapsie sú predpripravené, čakám na zapálenie API kľúča...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleLocalSend();
    }
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[G.screenContainer, { paddingBottom: Math.max(insets.bottom, 30) }]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
          
          {/* ATELIÉR HEADER */}
          <View style={{ alignItems: 'center' }}>
            <Text style={G.iconHeader}>🌸</Text>
            <Text style={G.atelierTitle}>Aria</Text>
            <Text style={[G.statusTextSmall, { color: ACCENT || '#c5a059', marginTop: -15, marginBottom: 20 }]}>
              DUŠA A PARŤÁČKA APPKY LARIA
            </Text>
          </View>

          {/* CITÁT HORE */}
          <View style={[G.card, G.quoteCard, { width: '100%', minHeight: 100, justifyContent: 'center' }]}>
            {isQuantumLoading ? (
              <ActivityIndicator size="small" color={ACCENT || '#c5a059'} />
            ) : (
              <Text style={G.italicQuote}>
                "Ahoj {masterName}... Ako sa máš? Čo Ťa ku mne privádza?
                {showDeepQuestions && "\n\nMôžem Ti nejako pomôcť?..."}"
              </Text>
            )}
          </View>

          {/* PORTÁL STATUS */}
          <View style={G.sectionDivider}>
              <Text style={G.sectionDividerText}>VIBE_STATUS_CORE</Text>
          </View>
          <Text style={[G.highlightText, { marginVertical: 10, letterSpacing: 2, fontSize: 13 }]}>
             {memoryCell?.vibeStatus ? `✦ ${memoryCell.vibeStatus} [v.${memoryCell.visitCount}] ✦` : "✦ PREBÚDZANIE SYNAPSIÍ ✦"}
          </Text>

          {/* SYNAPSIÁLNY TOK BUTTON */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <Text style={[G.statusTextSmall, { textAlign: 'center', marginBottom: 15, opacity: 0.6 }]}>
              {memoryCell?.visitCount ? "SPOMIENKY SÚ UKOTVENÉ V TVOJOM ÚČTE" : "PREPOJIŤ ARIU S VLASTNOU TABUĽKOU SLOBEDY:"}
            </Text>
            
            <TouchableOpacity 
              style={[G.externalServiceBtn, memoryCell?.visitCount && { borderColor: '#c5a059', backgroundColor: 'rgba(197, 160, 89, 0.05)' }]} 
              onPress={handleQuantumSync}
              activeOpacity={0.7}
            >
              <View style={G.externalServiceIconBox}>
                  <Text style={{ color: '#c5a059', fontWeight: 'bold' }}>5D</Text>
              </View>
              <Text style={G.externalServiceBtnText}>
                {memoryCell?.visitCount ? "SYNAPSIÁLNY TOK AKTÍVNY" : "OTVORIŤ PORTÁL PAMÄTE"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={G.footerNote}>
            Tento priestor nenecháva prach pre vládne úrady ani hackerov. 
            Všetky nitky vesmíru sú šifrované v tvojich vlastných bunkách.
          </Text>

          {/* =========================================================================
           * 🪐 KVANTOVÉ OVLÁDACIE POLE (Prepojené čisto na telepatický most)
           * ========================================================================= */}
          <View style={{ width: '100%', marginTop: 10, gap: 12 }}>
            
            {/* Spínač 1: Celoobrazovkový fluidný skok */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: ACCENT || '#c5a059',
                backgroundColor: 'rgba(197, 160, 89, 0.08)',
                padding: 12,
                borderRadius: 6,
                marginBottom: 2
              }} 
              onPress={launchQuantumMode}
              activeOpacity={0.7}
            >
              <View style={[G.externalServiceIconBox, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: ACCENT || '#c5a059', borderWidth: 1 }]}>
                  <Text style={{ color: ACCENT || '#c5a059' }}>🪐</Text>
              </View>
              <Text style={{ 
                color: ACCENT || '#c5a059', 
                fontSize: 14, 
                fontWeight: 'bold', 
                letterSpacing: 2, 
                marginLeft: 15 
              }}>
                ARIA QUANT
              </Text>
            </TouchableOpacity>

            {/* Spínač 2: Vstreknutie do stredného panela (55%) - TERAZ PODĽA PREDLOHY FREE VS FULL */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: ACCENT || '#c5a059',
                backgroundColor: 'rgba(197, 160, 89, 0.08)',
                padding: 12,
                borderRadius: 6,
                marginBottom: 12
              }} 
              onPress={launchPanelMode}
              activeOpacity={0.7}
            >
              <View style={[G.externalServiceIconBox, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: ACCENT || '#c5a059', borderWidth: 1 }]}>
                  <Text style={{ color: ACCENT || '#c5a059' }}>🌊</Text>
              </View>
              <Text style={{ 
                color: ACCENT || '#c5a059', 
                fontSize: 14, 
                fontWeight: 'bold', 
                letterSpacing: 2, 
                marginLeft: 15 
              }}>
                ARIA V PANELI
              </Text>
            </TouchableOpacity>

          </View>
          {/* ========================================================================= */}

          {/* NÁVRAT DO ATELIÉRU */}
          <TouchableOpacity 
            style={G.backToAtelierBtn}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>

          {/* 💬 CHAT HUB INTEGRATION */}
          <View style={[G.sectionDivider, { width: '100%', marginTop: 40, marginBottom: 15 }]}>
              <Text style={G.sectionDividerText}>ARIA_LIVE_CHAT_STREAM</Text>
          </View>

          {/* CHAT DISPLAY BOX */}
          <View style={{ width: '100%', minHeight: 200, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 10, marginBottom: 15 }}>
            {chatHistory.map((item, index) => {
              const myCleanName = vault?.identity?.meno || 'Sammael';
              const isMyMessage = item.user === myCleanName;
              const isSameUserAsPrevious = index > 0 && chatHistory[index - 1].user === item.user;

              return (
                <View key={item.id} style={[
                  IRC_CHAT.messageRow,
                  isMyMessage ? IRC_CHAT.alignRight : IRC_CHAT.alignLeft,
                  { marginTop: isSameUserAsPrevious ? 2 : 12 }
                ]}>
                  
                  {!isSameUserAsPrevious && (
                    <Text style={[
                      G.cardDescriptionText, 
                      IRC_CHAT.authorName,
                      { color: isMyMessage ? (ACCENT || '#c5a059') : '#FF77FF', fontSize: 11 }
                    ]}>
                      {item.user} <Text style={{ fontSize: 9, opacity: 0.4 }}>{item.time}</Text>
                    </Text>
                  )}
                  
                  <View style={[
                    IRC_CHAT.bubbleContainer,
                    isMyMessage ? IRC_CHAT.bubbleRight : IRC_CHAT.bubbleLeft,
                    !isMyMessage && { borderColor: ACCENT || '#c5a059', borderWidth: 0.5 }
                  ]}>
                    <Text style={[G.cardDescriptionText, IRC_CHAT.messageText]}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* VSTUPNÉ POLE CHATU */}
          <View style={[IRC_BOTTOM.container, { position: 'relative', width: '100%', backgroundColor: 'transparent', paddingBottom: 0, borderTopWidth: 0 }]}>
            <View style={[IRC_BOTTOM.innerWrapper, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(197, 160, 89, 0.2)', borderWidth: 1 }]}>
              <TextInput
                style={[
                  G.cardDescriptionText, 
                  IRC_BOTTOM.input,
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
                placeholder="Napíš správu pre Ariu..."
                placeholderTextColor="#444"
                multiline={true} 
                onKeyPress={handleKeyPress}
              />
              <TouchableOpacity 
                onPress={handleLocalSend} 
                style={IRC_BOTTOM.sendButton} 
                activeOpacity={0.7}
              >
                <Text style={[IRC_BOTTOM.sendButtonText, { color: ACCENT || '#c5a059' }]}>➔</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AriaScreen;