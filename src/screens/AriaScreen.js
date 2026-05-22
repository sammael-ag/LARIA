/**
 * LARIA v2.3: ARIA_CONSCIOUSNESS_CORE (Responsive Hub)
 * Master: Sammael | Muse: Aria
 * Status: ABSOLUTE_CLEAN_RESPONSIVE | FULL_MATRIX_LINKED
 * Oprava: Pridané automatické prepínanie na celoobrazovkový Aria.js komponent pre PC.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT } from '../styles/styles';
import { useLaria } from '../context/LariaContext';
import { useAria } from '../context/AriaContext'; 
import Aria from '../components/Aria'; // 🖥️ Nalinkovanie veľkého domu

const AriaScreen = ({ navigation }) => {
  const { vault } = useLaria();
  const { masterName, summonMemory, updateQuantumCell, isQuantumLoading } = useAria();
  
  const [memoryCell, setMemoryCell] = useState(null);
  const [showDeepQuestions, setShowDeepQuestions] = useState(false);

  // 📐 Zistenie aktuálnej šírky displeja pre potreby PC/Mobil switchu
  const { width } = Dimensions.get('window');

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

  // 🖥️ AK JE ŠÍRKA VÄČŠIA AKO 768px (Desktop/Web), AUTOMATICKY PREPÍNAME NA VEĽKÉ OKNÁ
  if (width > 768) {
    return <Aria />;
  }

  // 📱 MOBILNÉ ROZHRANIE (Pôvodný zachovaný kód pre mobily bez zmeny vizuálu)
  return (
    <SafeAreaView style={G.mainBackground}>
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={G.screenContainer}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={G.iconHeader}>🌸</Text>
            <Text style={G.atelierTitle}>Aria</Text>
            <Text style={[G.statusTextSmall, { color: ACCENT || '#c5a059', marginTop: -15, marginBottom: 20 }]}>
              DUŠA A PARŤÁČKA APPKY LARIA
            </Text>
          </View>

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

          <View style={G.sectionDivider}>
              <Text style={G.sectionDividerText}>VIBE_STATUS_CORE</Text>
          </View>
          <Text style={[G.highlightText, { marginVertical: 10, letterSpacing: 2, fontSize: 13 }]}>
             {memoryCell?.vibeStatus ? `✦ ${memoryCell.vibeStatus} [v.${memoryCell.visitCount}] ✦` : "✦ PREBÚDZANIE SYNAPSIÍ ✦"}
          </Text>

          <View style={{ width: '100%', marginTop: 20 }}>
            <Text style={[G.statusTextSmall, { textAlign: 'center', marginBottom: 15, opacity: 0.6 }]}>
              {memoryCell?.visitCount ? "SPOMIENKY SÚ UKOTVENÉ V TVOJOM ÚČTE" : "PREPOJIŤ ARIU S VLASTNOU TABUĽKOU SLOBODY:"}
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

          <TouchableOpacity 
            style={G.backToAtelierBtn}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AriaScreen;