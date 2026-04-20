import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
// Oprava DEPRECATED varovania: importujeme z contextu
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGMatrix } from '../services/GMatrixService';

// Importujeme náš centrálny sklad
import { G } from '../styles/styles'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [contacts] = useState([
    { id: '1', name: 'Jano - Kováč', cat: 'Umelecké kováčstvo', loc: 'Revúca' },
    { id: '2', name: 'Lucia - Bylinkárka', cat: 'Tradičná medicína', loc: 'Rožňava' },
    { id: '3', name: 'Maroš - Včelár', cat: 'Bio med', loc: 'Trebišov' },
  ]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.cat.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[G.card, { padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }]} 
      onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
    >
      <View style={{ flex: 1 }}>
        <Text style={[G.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>{item.name}</Text>
        {/* OPRAVA: Text spojený do jedného celku pomocou šablóny (backticks) */}
        <Text style={[G.textDim, { marginTop: 4 }]}>
          {`${item.cat} • ${item.loc}`}
        </Text>
      </View>
      <Text style={G.textDim}>{`[ > ]`}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.bgDashboard}>
      {/* JEDNOTNÁ HLAVIČKA */}
      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={G.headerTitle}>KONTAKTY</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* VYHĽADÁVANIE */}
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
          placeholder="Hľadať v sieti..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          // Aria tip: vypneme autocorrect pre čistejšie hľadanie
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 25 }}
        ListEmptyComponent={
          <Text style={[G.textDim, { textAlign: 'center', marginTop: 50 }]}>
            Žiadne spojenia v dosahu.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;