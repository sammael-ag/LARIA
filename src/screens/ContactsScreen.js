import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native'; // Dôležité pre okamžitý update
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { G } from '../styles/styles'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);

  // useFocusEffect zabezpečí, že zakaždým, keď Sammael otvorí túto obrazovku, 
  // Aria prečíta najnovšie záznamy z AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadContacts = async () => {
        try {
          const stored = await AsyncStorage.getItem('laria_contacts');
          if (stored) {
            setContacts(JSON.parse(stored));
          }
        } catch (e) {
          console.error("Chyba pri načítaní reťazca:", e);
        }
      };
      loadContacts();
    }, [])
  );

  // Zoradenie: Pripnuté (📍) idú prvé, potom zvyšok podľa mena
  const sortedContacts = [...contacts]
    .filter(c => 
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) || 
      (c.cat && c.cat.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        G.card, 
        { padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
        item.pinned && { borderColor: '#0FF', borderWidth: 1 }
      ]} 
      onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.pinned && <Text style={{ marginRight: 8, fontSize: 14 }}>📍</Text>}
          <Text style={[G.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>
            {item.name}
          </Text>
        </View>
        <Text style={[G.textDim, { marginTop: 4, fontSize: 12 }]}>
          {`${item.cat || 'Majster'} • ${item.loc || 'Matrix'}`}
        </Text>
      </View>
      
      {/* Vizuálny indikátor overeného kontraktu (Smart Contract) */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[
          { fontSize: 10, fontWeight: 'bold' },
          item.isVerified ? { color: '#0FF' } : { color: '#444' }
        ]}>
          {item.isVerified ? '● SC_ACTIVE' : '○ LOCKED'}
        </Text>
        {item.revo ? <Text style={{ fontSize: 9, color: '#0F0', marginTop: 2 }}>€ REV_ID</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[G.bgDashboard, { flex: 1 }]}>
      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={G.headerTitle}>SIEŤ SPOJENÍ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* SEARCH BAR */}
      <View style={{ paddingHorizontal: 25, marginBottom: 20 }}>
        <TextInput 
          style={{ 
            backgroundColor: '#0A0A0A', 
            borderWidth: 1, 
            borderColor: '#222', 
            borderRadius: 8, 
            padding: 12, 
            color: '#0F0', 
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
            fontSize: 14
          }}
          placeholder="Hľadať v reťazci..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* ZOZNAM KONTAKTOV */}
      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={[G.textDim, { textAlign: 'center', lineHeight: 22 }]}>
              Tvoj lokálny reťazec je zatiaľ prázdny.{"\n"}
              <Text style={{ color: '#0FF' }}>Prijmi vizitku cez #LARIA_SECURE_IRC.</Text>
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;