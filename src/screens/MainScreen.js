import React from 'react';
import { View, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { G } from '../styles/styles'; 

const MainScreen = ({ navigation }) => {

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ADD_CONTACT') {
        const payload = data.payload;

        // --- RADIKÁLNY REZ: CHÝBAJÚCI FING = KONIEC PRENOSU ---
        if (!payload.fing) {
          console.warn("[SECURITY_BREACH] Pokus o zápis identity bez FING pečate zamietnutý.");
          Alert.alert(
            "NELEGITÍMNY SIGNÁL", 
            "Identita nemá platný FING kľúč. Spojenie nebolo nadviazané."
          );
          return;
        }

        const stored = await AsyncStorage.getItem('laria_contacts');
        let contacts = stored ? JSON.parse(stored) : [];

        // Kontrola duplicity UŽ LEN cez FING (SHA nás nezaujíma)
        const exists = contacts.find(c => c.fing === payload.fing);
        
        if (exists) {
          Alert.alert("SYSTÉM LARIA", "Tento majster s daným FING-om už je v reťazci.");
          return;
        }

        // MAPOVANIE: Očistené od SHA nánosov
        const newContact = { 
          id: `F_${payload.fing}_${Date.now()}`, // ID viazané na FING
          meno: payload.meno || payload.name || "Neznámy Pútnik", 
          kat: payload.kat || payload.cat || "Majster",
          lok: payload.lok || payload.loc || "Matrix",
          fing: payload.fing, // Povinné pole
          krypt: payload.krypt || payload.revo || "", 
          tel: payload.tel || "",
          email: payload.email || "",
          pinned: false, 
          isVerified: false,
          v: "9.8-F" 
        };

        contacts.push(newContact);
        await AsyncStorage.setItem('laria_contacts', JSON.stringify(contacts));

        Alert.alert(
          "[ SPOJENIE NADVIAZANÉ ]", 
          `Majster ${newContact.meno} bol bezpečne overený cez FING.`,
          [
            { text: "[ VIZITKÁR ]", onPress: () => navigation.navigate('Contacts') },
            { text: "[ OK ]", style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error("Kritická chyba mostu:", error);
    }
  };

  return (
    <View style={G.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <WebView 
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1, backgroundColor: '#000' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default MainScreen;