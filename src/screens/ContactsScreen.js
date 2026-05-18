/**
 * LARIA v2.0: ContactsScreen (Reťazec spojení)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_CLEAN_CONTACTS
 * Oprava: Odstránené hranaté zátvorky z textov a Alertov, nasadená top-left šípka pre progresívcov, vycentrovaná geometria a fixný spodný návrat.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G, ACCENT } from '../styles/styles'; 
import { useContacts } from '../../context/ContactContext'; 

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null); 
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
      Alert.alert("MATRIX SYNC", "Identita bola úspešne preleštená čerstvými dátami.");
    } else {
      Alert.alert("CHYBA SPOJENIA", result.error);
    }
  };

  const handleLongPress = (item) => {
    const displayMeno = item.meno || "Pútnik";
    const publicFing = item.fing;

    Alert.alert(
      `IDENTITA: ${publicFing?.toUpperCase()}`,
      `Meno: ${displayMeno}\nPosledná synchronizácia: ${item.syncedAt ? new Date(item.syncedAt).toLocaleTimeString() : 'Nikdy'}\n\nZvoľ operáciu:`,
      [
        { text: 'ZRUŠIŤ', style: 'cancel' },
        { 
          text: 'RE-SYNCHRONIZOVAŤ', 
          onPress: () => handleSync(publicFing) 
        },
        { 
          text: item.pinned ? 'ODPNÚŤ' : 'PRIPNÚŤ NA VRCH', 
          onPress: () => togglePin(publicFing) 
        },
        { 
          text: 'TERMINOVAŤ', 
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
            flexDirection: 'row', 
            alignItems: 'center', 
            borderColor: item.pinned ? ACCENT : '#1a1a1a', 
            backgroundColor: item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505',
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
          borderWidth: 1, borderColor: item.pinned ? ACCENT : '#333'
        }}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={ACCENT} />
          ) : (
            <Text style={{ fontSize: 18 }}>{item.pinned ? '⭐' : '👤'}</Text>
          )}
        </View>

        {/* INFO */}
        <View style={{ flex: 1 }}>
          <Text style={[G.cardTitleText, { fontSize: 14, letterSpacing: 1 }]}>
            {displayMeno.toUpperCase()}
          </Text>
          <Text style={[G.statusTextSmall, { fontSize: 9, marginTop: 2 }]}>
            {displayKat.toUpperCase()} • {item.lok || 'V SIETI'}
          </Text>
          <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 4 }]}>
            ID: {displayFing} {item.syncedAt ? '✓' : ''}
          </Text>
        </View>

        {/* STATUS INDIKÁTOR */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ 
            width: 6, height: 6, borderRadius: 3, 
            backgroundColor: item.syncedAt ? '#0FF' : (item.pinned ? ACCENT : '#1a1a1a')
          }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[G.mainBackground, { position: 'relative' }]}>
      
      {/* ⬅️ PRE PROGRESÍVCOV: Navigačná šípka na pevnom mieste */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 📐 STREDOVÝ ANKOR PRE MAX ŠÍRKU */}
      <View style={{ flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', paddingHorizontal: 16 }}>
        
        {/* ČISTÁ HLAVIČKA BEZ DRUHÉHO SPÄŤ */}
        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 15 }}>
          <Text style={G.atelierTitle}>REŤAZEC SPOJENÍ</Text>
        </View>

        <FlatList
          data={sortedContacts}
          keyExtractor={(item) => item.fing}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }} // Pľac, aby spodné pevné tlačidlo nezavadzalo
          ListHeaderComponent={
            <View style={{ marginBottom: 20 }}>
              <TextInput 
                style={G.vaultInput} 
                placeholder="HĽADAŤ (MENO, KAT, ID)..."
                placeholderTextColor="#444"
                value={search}
                onChangeText={setSearch}
              />
              
              <TouchableOpacity 
                style={[G.primaryBtn, { marginTop: 10 }]} 
                onPress={() => navigation.navigate('Scanner')}
                activeOpacity={0.7}
              >
                <Text style={G.primaryBtnText}>
                  + PRIJAŤ NOVÚ PEČAŤ
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* ↩️ PRE KONZERVATÍVCOV: Spodný návrat pevne zakotvený v geometrii */}
        <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, alignItems: 'center' }}>
          <TouchableOpacity 
            style={G.backToAtelierBtn}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default ContactsScreen;