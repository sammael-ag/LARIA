import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; 
// DOLEŽITÉ: Prepojenie na náš nový Sklad
import { useContacts } from '../../context/ContactContext'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  
  // Tu sa deje tá mágia: už žiadne manuálne loadovanie cez useEffect/AsyncStorage!
  // Sklad (Context) to robí za teba a hneď ti dáva čerstvé kontakty.
  const { contacts } = useContacts();

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
        item.pinned && { borderColor: '#0FF', borderWidth: 1 }
      ]} 
      onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.pinned && <Text style={{ marginRight: 8 }}>📍</Text>}
          <Text style={G.textWhite}>
            {item.name}
          </Text>
        </View>
        <Text style={G.textDim}>
          {`${item.cat || 'Majster'} • ${item.loc || 'Matrix'}`}
        </Text>
      </View>
      
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[
          G.textCyber, { fontSize: 10 },
          item.isVerified ? { color: '#0FF' } : { color: '#444' }
        ]}>
          {item.isVerified ? '● SC_ACTIVE' : '○ LOCKED'}
        </Text>
        {item.revo ? <Text style={[G.textCyber, { fontSize: 9, color: '#0F0', marginTop: 2 }]}>€ REV_ID</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.bg}>
      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={G.headerTitle}>SIEŤ SPOJENÍ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={{ paddingHorizontal: 25, marginBottom: 15 }}>
        <TouchableOpacity 
          style={[G.btnMain, { borderColor: '#0F0', backgroundColor: '#000' }]} 
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={[G.textCyber, { color: '#0F0' }]}>
            [ SKENOVAŤ QR VIZITKU ]
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 25, marginBottom: 20 }}>
        <TextInput 
          style={[G.input, { color: '#0F0' }]} 
          placeholder="Hľadať v reťazci..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={[G.textDim, { textAlign: 'center' }]}>
              Tvoj lokálny reťazec je prázdny.{"\n"}
              <Text style={{ color: '#0FF' }}>Prijmi vizitku cez QR alebo #LARIA_SECURE_IRC.</Text>
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;