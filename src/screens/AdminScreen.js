import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import styles from '../styles/styles'; 
// Napojenie na tvoje nové krypto-vedomie
import { useKrypto } from '../context/KryptoContext';

const AdminScreen = () => {
  // Sammael, tu si berieme reálne dáta priamo z tvojej sýpky na Base
  const { adminEthBalance, adminLariaBalance, isLoading, lariaContractAddress } = useKrypto();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LARIA Architect Velín</Text>
        <Text style={styles.subtitleText}>Vedomie: Sammael</Text>
      </View>

      {/* Stav Sýpky - Reálne dáta z blockchainu */}
      <View style={styles.card}>
        <Text style={styles.cardTitleText}>Stav Sýpky (Base Mainnet)</Text>
        {isLoading ? (
          <ActivityIndicator color="#f1c40f" />
        ) : (
          <>
            <Text style={styles.cardDescription}>Palivo (ETH): {adminEthBalance}</Text>
            <Text style={styles.cardDescription}>Zásoby (LARIA): {adminLariaBalance}</Text>
            <Text style={[styles.cardDescription, { fontSize: 10, marginTop: 5, opacity: 0.6 }]}>
              Contract: {lariaContractAddress}
            </Text>
          </>
        )}
      </View>

      {/* Systémová kontrola - Tu bude napojený tvoj Gbot */}
      <View style={styles.card}>
        <Text style={styles.cardTitleText}>Systémová Kontrola</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
          <Text style={styles.cardDescription}>Gbot Status:</Text>
          {/* Zatiaľ statické, kým neoživíme tvojho Google bota */}
          <Text style={[styles.statusBadge, { color: '#2ecc71' }]}>Online</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
          <Text style={styles.cardDescription}>Brána (Gateway):</Text>
          <Text style={[styles.statusBadge, { color: '#2ecc71' }]}>Aktívna</Text>
        </View>
      </View>

      {/* Ovládacie prvky Architekta */}
      <View style={{ paddingHorizontal: 10 }}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 10 }]}
          onPress={() => console.log("EMERGENCY_STOP_TRIGGERED")}
        >
          <Text style={styles.buttonText}>Pozastaviť Bránu (Emergency)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#34495e', marginTop: 15 }]}
          onPress={() => console.log("SHOW_BOT_LOGS")}
        >
          <Text style={styles.buttonText}>Zobraziť Logy Gbota</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#f1c40f', marginTop: 15 }]}
          onPress={() => console.log("FORCE_SYNC_MATRIX")}
        >
          <Text style={[styles.buttonText, { color: '#000' }]}>Vynútiť Sync Matrixu</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

export default AdminScreen;