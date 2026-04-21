import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Budeš potrebovať na trvalé uloženie
import { G } from '../styles/styles'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]); // Prázdne, čaká na dáta z WebView

  // Načítanie uložených kontaktov zo systému (tvoj lokálny chain)
  useEffect(() => {
    const loadContacts = async () => {
      const stored = await AsyncStorage.getItem('laria_contacts');
      if (stored) setContacts(JSON.parse(stored));
    };
    loadContacts();
  }, []);

  // Logika pre PIN - zoradenie (pripnuté idú hore)
  const sortedContacts = [...contacts]
    .filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.cat.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.pinned === a.pinned) ? 0 : a.pinned ? -1 : 1);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        G.card, 
        { padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
        item.pinned && { borderColor: '#0FF', borderWidth: 1 } // Tyrkysový okraj pre pripnuté
      ]} 
      onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.pinned && <Text style={{ marginRight: 8 }}>📍</Text>}
          <Text style={[G.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>{item.name}</Text>
        </View>
        <Text style={[G.textDim, { marginTop: 4 }]}>
          {`${item.cat} • ${item.loc}`}
        </Text>
      </View>
      {/* Tu sa neskôr zobrazí status: LOCK (pred SC) alebo UNLOCK (po SC) */}
      <Text style={[G.textDim, { fontSize: 10 }]}>{item.isVerified ? '● SC' : '○ LOCK'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.bgDashboard}>
      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={G.headerTitle}>SIEŤ SPOJENÍ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={{ paddingHorizontal: 25, marginBottom: 20 }}>
        <TextInput 
          style={{ 
            backgroundColor: '#0A0A0A', 
            borderWidth: 1, 
            borderColor: '#222', 
            borderRadius: 8, 
            padding: 12, 
            color: '#0F0', 
            fontFamily: 'monospace',
            fontSize: 14
          }}
          placeholder="Hľadať v tvojom reťazci..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 25 }}
        ListEmptyComponent={
          <Text style={[G.textDim, { textAlign: 'center', marginTop: 50 }]}>
            Tvoj lokálny reťazec je zatiaľ prázdny.{"\n"}Pridaj majstra cez LARIA WEB.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;