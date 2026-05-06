import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; 
import { useContacts } from '../../context/ContactContext'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { contacts, togglePin, deleteContact } = useContacts();

  // --- DEEP LINKING (Zachytávanie spojení z vonkajšieho sveta) ---
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

  // --- FILTROVANIE A TRIEDENIE (Priorita pripnutým) ---
  const sortedContacts = [...contacts]
    .filter(c => {
      const meno = c.meno || c.name || ""; 
      const kategoria = c.kat || c.kategoria || c.cat || "";
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
          onPress: () => togglePin(item.id || item.sha) 
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
                { text: 'ÁNO, VYMAZAŤ', style: 'destructive', onPress: () => deleteContact(item.id || item.sha) }
              ]
            );
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    // --- MAPOVANIE PREMENNÝCH v8.0 ---
    const displayMeno = item.meno || item.name || "Pútnik";
    const displayKat = item.kat || item.kategoria || item.cat || "Hľadač";

    return (
      <TouchableOpacity 
        style={[
          G.card, 
          { 
            padding: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 12, 
            borderColor: item.pinned ? '#0FF' : 'rgba(255,255,255,0.05)',
            borderWidth: item.pinned ? 1 : 0.5,
            backgroundColor: item.pinned ? 'rgba(0, 255, 255, 0.03)' : 'rgba(255,255,255,0.02)'
          }
        ]} 
        onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        {/* AVATAR / IKONA */}
        <View style={{
          width: 48, height: 48, backgroundColor: '#000', borderRadius: 12, 
          justifyContent: 'center', alignItems: 'center', marginRight: 15,
          borderWidth: 1, borderColor: item.pinned ? '#0FF' : '#333'
        }}>
          <Text style={{ fontSize: 20 }}>{item.pinned ? '📍' : '👤'}</Text>
        </View>

        {/* INFO */}
        <View style={{ flex: 1 }}>
          <Text style={[G.textWhite, { fontSize: 15, fontWeight: 'bold', letterSpacing: 1.5 }]}>
            {displayMeno.toUpperCase()}
          </Text>
          <Text style={[G.textDim, { fontSize: 10, marginTop: 4, letterSpacing: 1 }]}>
            {displayKat.toUpperCase()} • {item.lok || 'V SIETI'}
          </Text>
        </View>

        {/* STATUS INDIKÁTORY */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ 
            width: 8, height: 8, borderRadius: 4, 
            backgroundColor: item.isVerified ? '#0FF' : '#444',
            marginBottom: 8,
            shadowColor: item.isVerified ? '#0FF' : '#000',
            shadowRadius: 4, shadowOpacity: 0.8
          }} />
          {(item.irc || item.krypt) && (
            <View style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 4, borderRadius: 4 }}>
              <Text style={{ color: '#0F0', fontSize: 7, fontWeight: 'bold' }}>$ ACTIVE</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={G.bg}>
      <View style={{ alignItems: 'center', marginTop: 10, paddingHorizontal: 15 }}>
        <Text style={{
          fontSize: 8, color: '#444', letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
        }}>
          LOCAL_ENCRYPTED_CHAIN // UZLY: {contacts.length}
        </Text>
      </View>

      <View style={G.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={G.textDim}>[ SPÄŤ ]</Text>
        </TouchableOpacity>
        <Text style={G.headerTitle}>REŤAZEC SPOJENÍ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => (item.id || item.sha)?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        
        ListHeaderComponent={
          <View style={{ marginBottom: 25 }}>
            {/* VYHĽADÁVANIE */}
            <TextInput 
              style={{
                backgroundColor: '#050505',
                color: '#0F0',
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                padding: 18,
                borderWidth: 1,
                borderColor: '#1a1a1a',
                borderRadius: 12,
                fontSize: 14
              }} 
              placeholder="HĽADAŤ V MATRIXE..."
              placeholderTextColor="#333"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            
            {/* RÝCHLY SKENER */}
            <TouchableOpacity 
              style={{ 
                marginTop: 15, 
                padding: 18, 
                backgroundColor: '#000', 
                borderWidth: 1, 
                borderColor: '#0FF', 
                borderRadius: 15, 
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#0FF',
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 5
              }} 
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={{ marginRight: 10 }}>📡</Text>
              <Text style={[G.mono, { color: '#0FF', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 }]}>
                PRIJAŤ NOVÚ PEČAŤ
              </Text>
            </TouchableOpacity>
          </View>
        }

        ListEmptyComponent={
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 30, marginBottom: 20, opacity: 0.2 }}>🕸️</Text>
            <Text style={[G.textDim, { textAlign: 'center', fontSize: 10, letterSpacing: 2, lineHeight: 18 }]}>
              REŤAZEC JE PRÁZDNY.{"\n"}ŽIADNE AKTÍVNE SPOJENIA V TOMTO UZLE.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;