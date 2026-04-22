import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
// Import tvojich centrálnych štýlov
import styles from '../styles/styles'; 

const AdminScreen = () => {
  // Dáta pripravené na budúce napojenie na blockchain
  const stats = {
    balanceETH: "0.00",
    balanceToken: "0",
    gbotStatus: "Online",
    gatewayActive: true
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LARIA Architect Velín</Text>
        <Text style={styles.subtitleText}>Vitaj, Sammael</Text>
      </View>

      {/* Rýchly prehľad sýpky */}
      <View style={styles.card}>
        <Text style={styles.cardTitleText}>Stav Sýpky (Base)</Text>
        <Text style={styles.cardDescription}>ETH: {stats.balanceETH}</Text>
        <Text style={styles.cardDescription}>LARIA Tokens: {stats.balanceToken}</Text>
      </View>

      {/* Stav systémov */}
      <View style={styles.card}>
        <Text style={styles.cardTitleText}>Systémová Kontrola</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
          <Text style={styles.cardDescription}>Gbot Status:</Text>
          <Text style={[styles.statusBadge, { color: '#2ecc71' }]}>{stats.gbotStatus}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
          <Text style={styles.cardDescription}>Brána:</Text>
          <Text style={[styles.statusBadge, { color: stats.gatewayActive ? '#2ecc71' : '#e74c3c' }]}>
            {stats.gatewayActive ? "Aktívna" : "Pozastavená"}
          </Text>
        </View>
      </View>

      {/* Akčné tlačidlá */}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 20 }]}>
        <Text style={styles.buttonText}>Pozastaviť Bránu (Emergency)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#34495e', marginTop: 15 }]}>
        <Text style={styles.buttonText}>Zobraziť Logy Gbota</Text>
      </TouchableOpacity>
      
      {/* Odsadenie spodku pre pohodlný scroll */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

export default AdminScreen;