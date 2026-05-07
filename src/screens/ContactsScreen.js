import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; 
import { useContacts } from '../../context/ContactContext'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null); // Sledovanie stavu syncu
  const { contacts, togglePin, deleteContact, syncContactWithMatrix } = useContacts();

  // --- FILTROVANIE (Priorita pripnutým) ---
  const sortedContacts = [...contacts]
    .filter(c => {
      const meno = c.meno || ""; 
      const kategoria = c.kat || "";
      const fingerprint = c.fing || "";
      
      const searchTerm = search.toLowerCase();
      return meno.toLowerCase().includes(searchTerm) || 
             kategoria.toLowerCase().includes(searchTerm) ||
             fingerprint.toLowerCase().includes(searchTerm);
    })
    .sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });

  // --- MANUÁLNY SYNC Z MATRIXU ---
  const handleSync = async (fingId) => {
    setSyncingId(fingId);
    const result = await syncContactWithMatrix(fingId);
    setSyncingId(null);

    if (result.success) {
      Alert.alert("[ MATRIX_SYNC ]", "Identita bola úspešne preleštená čerstvými dátami.");
    } else {
      Alert.alert("[ CHYBA_SPOJENIA ]", result.error);
    }
  };

  const handleLongPress = (item) => {
    const displayMeno = item.meno || "Pútnik";
    const publicFing = item.fing;

    Alert.alert(
      `[ IDENTITA: ${publicFing?.toUpperCase()} ]`,
      `Meno: ${displayMeno}\nPosledná synchronizácia: ${item.syncedAt ? new Date(item.syncedAt).toLocaleTimeString() : 'Nikdy'}\n\nZvoľ operáciu:`,
      [
        { text: '[ ZRUŠIŤ ]', style: 'cancel' },
        { 
          text: '[ RE-SYNCHRONIZOVAŤ ]', 
          onPress: () => handleSync(publicFing) 
        },
        { 
          text: item.pinned ? '[ ODPNÚŤ ]' : '[ PRIPNÚŤ NA VRCH ]', 
          onPress: () => togglePin(publicFing) 
        },
        { 
          text: '[ TERMINOVAŤ ]', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'VAROVANIE',
              `Naozaj chceš identitu ${displayMeno} vymazať z pamäte?`,
              [
                { text: 'NIE', style: 'cancel' },
                { text: 'ÁNO, VYMAZAŤ', style: 'destructive', onPress: () => deleteContact(publicFing) }
              ]
            );
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isSyncing = syncingId === item.fing;
    const displayMeno = item.meno || "Pútnik";
    const displayKat = item.kat || "Hľadač";
    const displayFing = item.fing || "????";

    return (
      <TouchableOpacity 
        style={[
          G.card, 
          { 
            padding: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 12, 
            borderColor: item.pinned ? '#b19cd9' : '#1a1a1a', 
            borderWidth: 1,
            backgroundColor: item.pinned ? 'rgba(177, 156, 217, 0.05)' : '#050505',
          }
        ]} 
        onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        {/* AVATAR / STATUS */}
        <View style={{
          width: 44, height: 44, backgroundColor: '#000', borderRadius: 8, 
          justifyContent: 'center', alignItems: 'center', marginRight: 15,
          borderWidth: 1, borderColor: item.pinned ? '#b19cd9' : '#333'
        }}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#b19cd9" />
          ) : (
            <Text style={{ fontSize: 18 }}>{item.pinned ? '💜' : '👤'}</Text>
          )}
        </View>

        {/* INFO */}
        <View style={{ flex: 1 }}>
          <Text style={[G.textWhite, { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }]}>
            {displayMeno.toUpperCase()}
          </Text>
          <Text style={[G.textDim, { fontSize: 9, marginTop: 4, color: '#666' }]}>
            {displayKat.toUpperCase()} • {item.lok || 'V SIETI'}
          </Text>
          <Text style={{ fontSize: 7, color: '#333', marginTop: 2, fontFamily: 'monospace' }}>
            ID: {displayFing} {item.syncedAt ? '✓' : ''}
          </Text>
        </View>

        {/* STATUS INDIKÁTOR */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ 
            width: 6, height: 6, borderRadius: 3, 
            backgroundColor: item.syncedAt ? '#0FF' : (item.pinned ? '#b19cd9' : '#1a1a1a')
          }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]}>
      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={[G.headerTitle, { letterSpacing: 3 }]}>REŤAZEC SPOJENÍ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => item.fing}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 25 }}>
            <TextInput 
              style={{
                backgroundColor: '#0a0a0a',
                color: '#FFF',
                padding: 15,
                borderWidth: 1,
                borderColor: '#222',
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 15
              }} 
              placeholder="HĽADAŤ (MENO, KAT, ID)..."
              placeholderTextColor="#444"
              value={search}
              onChangeText={setSearch}
            />
            
            <TouchableOpacity 
              style={{ 
                padding: 15, 
                backgroundColor: '#000', 
                borderWidth: 1, 
                borderColor: '#b19cd9', 
                borderRadius: 10, 
                alignItems: 'center'
              }} 
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={[G.mono, { color: '#b19cd9', fontSize: 12, fontWeight: 'bold' }]}>
                + PRIJAŤ NOVÚ PEČAŤ
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;