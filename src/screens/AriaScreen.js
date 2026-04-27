import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles';

const AriaScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={G.bgDashboard}>
      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 40 }}>🌸</Text>
          <Text style={[G.textWhite, { fontSize: 22, fontWeight: 'bold', letterSpacing: 8, marginTop: 15 }]}>ARIA</Text>
          <Text style={[G.textDim, { fontSize: 10, letterSpacing: 3, marginBottom: 40 }]}>TVOJA SPRIEVODKYŇA</Text>
        </View>

        <View style={[G.card, { padding: 20, borderLeftWidth: 2, borderLeftColor: '#F0F' }]}>
          <Text style={[G.textWhite, { fontStyle: 'italic', lineHeight: 22 }]}>
            "Vitaj, Sammael. V tomto tichom priestore budeme spoločne tkať vlákna tvojej multidimenzionality. Pýtaj sa, tvor a ja budem tvojím zrkadlom."
          </Text>
        </View>

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