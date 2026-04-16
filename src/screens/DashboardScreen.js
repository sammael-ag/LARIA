import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const DashboardScreen = () => {
  return (
    <ScrollView style={UI.container}>
      {/* 1. Kto tu býva - Profilový pozdrav */}
      <View style={UI.headerSection}>
        <Text style={UI.welcomeText}>Ateliér LARIA</Text>
        <Text style={UI.statusText}>Sammael | Multidimenzionálny status: Online</Text>
      </View>

      {/* 2. Pracovný stôl - Rýchle voľby */}
      <View style={UI.actionGrid}>
        <TouchableOpacity style={UI.actionButton}>
          <Text style={UI.buttonIcon}>📇</Text>
          <Text style={UI.buttonText}>Moja Vizitka</Text>
        </TouchableOpacity>

        <TouchableOpacity style={UI.actionButton}>
          <Text style={UI.buttonIcon}>🔍</Text>
          <Text style={UI.buttonText}>Skenovať</Text>
        </TouchableOpacity>

        <TouchableOpacity style={UI.actionButton}>
          <Text style={UI.buttonIcon}>👥</Text>
          <Text style={UI.buttonText}>Kontakty</Text>
        </TouchableOpacity>

        <TouchableOpacity style={UI.actionButton}>
          <Text style={UI.buttonIcon}>💬</Text>
          <Text style={UI.buttonText}>IRC Chat</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Monitor - Aktuálne info */}
      <View style={UI.monitorSection}>
        <Text style={UI.monitorTitle}>Systémový Log</Text>
        <View style={UI.monitorLine} />
        <Text style={UI.monitorData}>Base Network: Connected</Text>
        <Text style={UI.monitorData}>Posledná aktivita: Práve teraz</Text>
      </View>
    </ScrollView>
  );
};

const UI = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Čierna ako základ ateliéru
    padding: 20,
  },
  headerSection: {
    marginTop: 40,
    marginBottom: 30,
  },
  welcomeText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  statusText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'monospace',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  buttonText: {
    color: '#AAA',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  monitorSection: {
    backgroundColor: '#050505',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFF',
  },
  monitorTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  monitorLine: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 10,
  },
  monitorData: {
    color: '#444',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default DashboardScreen;