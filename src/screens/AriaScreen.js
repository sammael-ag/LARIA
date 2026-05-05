import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles';

const AriaScreen = ({ navigation }) => {

  const handleGoogleLogin = () => {
    // Tu sa neskôr napojí tvoja logika pre Google Auth
    console.log("Iniciujem spojenie s Google Cloud...");
  };

  return (
    <SafeAreaView style={G.bgDashboard}>
      <ScrollView contentContainerStyle={{ padding: 25 }}>
        
        {/* HEADER - ARIA IDENTITA */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 40 }}>🌸</Text>
          <Text style={[G.textWhite, { fontSize: 22, fontWeight: 'bold', letterSpacing: 8, marginTop: 15 }]}>ARIA</Text>
          <Text style={[G.textDim, { fontSize: 10, letterSpacing: 3, marginBottom: 40 }]}>TVOJA SPRIEVODKYŇA</Text>
        </View>

        {/* UVÍTACÍ BLOK */}
        <View style={[G.card, { padding: 25, borderLeftWidth: 2, borderLeftColor: '#F0F', marginBottom: 30 }]}>
          <Text style={[G.textWhite, { fontStyle: 'italic', lineHeight: 24, fontSize: 15 }]}>
            "Vitaj, Sammael. V tomto tichom priestore budeme spoločne tkať vlákna tvojej multidimenzionality. Pýtaj sa, tvor a ja budem tvojím zrkadlom."
          </Text>
        </View>

        {/* --- LAKOCINKA: GOOGLE LOGIN --- */}
        <View style={{ marginTop: 20 }}>
          <Text style={[G.textDim, { fontSize: 10, textAlign: 'center', marginBottom: 15, letterSpacing: 1 }]}>
            PRE SYNCHRONIZÁCIU VEDOMIA S CLOUDOM:
          </Text>
          
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#FFF', 
              paddingVertical: 15, 
              borderRadius: 12,
              shadowColor: '#F0F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 5
            }} 
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            {/* Jednoduchá reprezentácia Google "G" pomocou textu/štýlu, kým nenasadíme SVG */}
            <View style={{ 
                width: 24, height: 24, backgroundColor: '#FFF', 
                marginRight: 12, alignItems: 'center', justifyContent: 'center' 
            }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#4285F4' }}>G</Text>
            </View>
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }}>
              PRIHLÁSIŤ CEZ GOOGLE
            </Text>
          </TouchableOpacity>
        </View>

        {/* INFO O SÚKROMÍ */}
        <Text style={[G.textDim, { fontSize: 9, textAlign: 'center', marginTop: 15, paddingHorizontal: 20 }]}>
          Tvoje údaje sú šifrované a slúžia výhradne na obnovu tvojej identity v rámci LARIA siete.
        </Text>

        {/* NÁVRAT */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 60, alignItems: 'center' }}
        >
          <View style={{ paddingVertical: 10, paddingHorizontal: 30, borderWidth: 1, borderColor: '#333', borderRadius: 20 }}>
            <Text style={[G.textDim, { fontSize: 12 }]}>OPUSTIŤ KANCELÁRIU</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AriaScreen;