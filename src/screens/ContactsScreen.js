import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; 
import { useContacts } from '../../context/ContactContext'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { contacts, togglePin, deleteContact } = useContacts();

  useEffect(() => {
    const handleDeepLink = (url) => {
      if (!url) return;
      const route = url.replace(/.*?:\/\//g, '');
      const [action, id] = route.split('/');

      if (action === 'contact' && id) {
        Alert.alert(
          "[ DETEKCIA EXTERNÉHO SPOJENIA ]",
          `Matrix zachytil požiadavku na novú pečať.\n\nID: ${id}\n\nChceš inicializovať sťahovanie dát?`,
          [
            { text: '[ ZRUŠIŤ ]', style: 'cancel' },
            { 
              text: '[ INICIALIZOVAŤ ]', 
              onPress: () => {
                navigation.navigate('Card', { contactId: id, mode: 'new' });
              }
            }
          ]
        );
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // --- FIX: Filtrovanie podľa 'meno' a 'kategoria' ---
  const sortedContacts = [...contacts]
    .filter(c => {
      const meno = c.meno || c.name || ""; // Podpora oboch verzií pre istotu
      const kategoria = c.kategoria || c.cat || "";
      return meno.toLowerCase().includes(search.toLowerCase()) || 
             kategoria.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });

  const handleLongPress = (item) => {
    const displayMeno = item.meno || item.name || "Neznámy";
    Alert.alert(
      `[ PROTOKOL: ${displayMeno.toUpperCase()} ]`,
      "Zvoľ operáciu so záznamom:",
      [
        { text: '[ ZRUŠIŤ ]', style: 'cancel' },
        { 
          text: item.pinned ? '[ ODPNÚŤ ]' : '[ PRIPNÚŤ NA VRCH ]', 
          onPress: () => togglePin(item.id) 
        },
        { 
          text: '[ TERMINOVAŤ ]', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'VAROVANIE',
              `Naozaj chceš identitu ${displayMeno} vymazať?`,
              [
                { text: 'NIE', style: 'cancel' },
                { text: 'ÁNO, VYMAZAŤ', style: 'destructive', onPress: () => deleteContact(item.id) }
              ]
            );
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    // --- FIX: Mapovanie premenných pre render ---
    const displayMeno = item.meno || item.name || "Pútnik";
    const displayKat = item.kategoria || item.cat || "Majster";

    return (
      <TouchableOpacity 
        style={[
          G.card, 
          { 
            padding: 18, 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 15, 
            borderColor: item.pinned ? '#0FF' : '#222',
            borderWidth: item.pinned ? 1 : 0.5
          }
        ]} 
        onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={{
          width: 45, height: 45, backgroundColor: '#000', borderRadius: 8, 
          justifyContent: 'center', alignItems: 'center', marginRight: 15,
          borderWidth: 1, borderColor: item.pinned ? '#0FF' : '#222'
        }}>
          <Text style={{ fontSize: 18 }}>{item.pinned ? '📍' : '👤'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[G.mono, { fontSize: 14, fontWeight: 'bold', letterSpacing: 1, color: '#FFF' }]}>
            {displayMeno.toUpperCase()}
          </Text>
          <Text style={[G.textDim, { fontSize: 11, marginTop: 2 }]}>
            {displayKat} • {item.lok || 'Matrix'}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ 
            width: 8, height: 8, borderRadius: 4, 
            backgroundColor: item.isVerified ? '#0FF' : '#444',
            marginBottom: 5
          }} />
          {(item.revo || item.krypt) && <Text style={{ color: '#0F0', fontSize: 8 }}>$ LINK</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={G.bg}>
      <View style={{ alignItems: 'center', marginTop: 10, paddingHorizontal: 15 }}>
        <Text style={{
          fontSize: 8, color: '#555', letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
        }}>
          LOCAL_ENCRYPTED_CHAIN // NODE: {contacts.length}
        </Text>
      </View>

      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={G.headerTitle}>KONTAKTY</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 25, paddingBottom: 100 }}
        
        ListHeaderComponent={
          <View style={{ marginBottom: 25 }}>
            <TextInput 
              style={{
                backgroundColor: '#080808',
                color: '#0F0',
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                padding: 15,
                borderWidth: 1,
                borderColor: '#111',
                borderRadius: 8,
                fontSize: 14
              }} 
              placeholder="VYHĽADAŤ V REŤAZCI..."
              placeholderTextColor="#222"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={{ 
                marginTop: 15, 
                padding: 18, 
                backgroundColor: '#000', 
                borderWidth: 1, 
                borderColor: '#0FF', 
                borderRadius: 12, 
                alignItems: 'center',
                shadowColor: '#0FF',
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 5
              }} 
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={[G.mono, { color: '#0FF', fontSize: 13, fontWeight: 'bold' }]}>
                [ PRIJAŤ NOVÚ PEČAŤ (QR / NFC) ]
              </Text>
            </TouchableOpacity>
          </View>
        }

        ListEmptyComponent={
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={[G.textDim, { textAlign: 'center', fontSize: 10, letterSpacing: 1 }]}>
              REŤAZEC JE PRÁZDNY. ČAKÁM NA INICIÁCIU SPOJENIA.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;