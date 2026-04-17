import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';

const ContactsScreen = ({ navigation }) => {
  // Cvičné dáta - tvoja budúca sieť
  const [search, setSearch] = useState('');
  const [contacts] = useState([
    { id: '1', name: 'Jano - Kováč', cat: 'Umelecké kováčstvo', loc: 'Revúca' },
    { id: '2', name: 'Lucia - Bylinkárka', cat: 'Tradičná medicína', loc: 'Rožňava' },
    { id: '3', name: 'Maroš - Včelár', cat: 'Bio med', loc: 'Trebišov' },
  ]);

  // Filter podľa hľadania
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.cat.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={UI.contactItem} 
      onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
    >
      <View style={UI.contactInfo}>
        <Text style={UI.contactName}>{item.name}</Text>
        <Text style={UI.contactCat}>{item.cat} • {item.loc}</Text>
      </View>
      <Text style={UI.arrow}>[ {'>'} ]</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={UI.container}>
      <View style={UI.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={UI.backBtn}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={UI.title}>KONTAKTY</Text>
      </View>

      {/* Vyhľadávanie - tvoja kľúčová požiadavka z noci */}
      <View style={UI.searchArea}>
        <TextInput 
          style={UI.searchInput}
          placeholder="Hľadať v sieti..."
          placeholderTextColor="#333"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={UI.listContent}
        ListEmptyComponent={<Text style={UI.emptyText}>Žiadne spojenia v dosahu.</Text>}
      />
    </SafeAreaView>
  );
};

const UI = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 25, 
    paddingTop: 50,
    justifyContent: 'space-between'
  },
  title: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 3, fontFamily: 'monospace' },
  backBtn: { color: '#444', fontSize: 12, fontFamily: 'monospace' },
  searchArea: { paddingHorizontal: 25, marginBottom: 20 },
  searchInput: { 
    backgroundColor: '#0A0A0A', 
    borderWidth: 1, 
    borderColor: '#111', 
    borderRadius: 8, 
    padding: 12, 
    color: '#0F0', 
    fontFamily: 'monospace',
    fontSize: 14
  },
  listContent: { paddingHorizontal: 25 },
  contactItem: { 
    backgroundColor: '#0A0A0A', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#111' 
  },
  contactInfo: { flex: 1 },
  contactName: { color: '#AAA', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' },
  contactCat: { color: '#444', fontSize: 11, marginTop: 4, fontFamily: 'monospace' },
  arrow: { color: '#222', fontSize: 12, fontFamily: 'monospace' },
  emptyText: { color: '#222', textAlign: 'center', marginTop: 50, fontFamily: 'monospace' }
});

export default ContactsScreen;