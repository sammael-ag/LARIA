import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../../context/LariaContext';
import { G } from '../styles/styles';

const DiagnosticScreen = ({ navigation }) => {
  const { vault } = useLaria();
  const { status, identity } = vault;

  if (!status.isAdmin) {
    return (
      <SafeAreaView style={[G.bgDashboard, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[G.textWhite, { fontSize: 40 }]}>⚠️</Text>
        <Text style={[G.mono, { color: '#F00', marginTop: 20 }]}>ACCESS DENIED</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 40 }}>
          <Text style={G.textDim}>[ NÁVRAT NA POVRCH ]</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={G.bgDashboard}>
      <View style={{ padding: 25 }}>
        <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>DIAGNOSTIC JADRO</Text>
        <Text style={[G.textCyber, { marginBottom: 40 }]}>ADMIN_LEVEL: 01 | SYSTEM_NOMINAL</Text>

        <View style={G.card}>
          <Text style={G.mono}>[ LOGS ]</Text>
          <Text style={[G.textDim, { fontSize: 12, marginTop: 10 }]}>- Matrix inicializovaný...</Text>
          <Text style={[G.textDim, { fontSize: 12 }]}>- Identita: {identity.sha?.substring(0, 16)}...</Text>
          <Text style={[G.textDim, { fontSize: 12 }]}>- Protokol Laria: AKTÍVNY</Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 50, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 }}
        >
          <Text style={G.textDim}>← SPÄŤ DO ATELIÉRU</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;