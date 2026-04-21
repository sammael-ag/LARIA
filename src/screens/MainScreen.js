import React from 'react';
import { View, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { G } from '../styles/styles'; 

const MainScreen = ({ navigation }) => {

  // TÁTO FUNKCIA JE MOST (BRIDGE) MEDZI WEBOM A APPKOU
  const handleMessage = async (event) => {
    try {
      // Rozbalíme dáta, ktoré prišli z webu
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ADD_CONTACT') {
        const newContact = data.payload;

        // 1. Vytiahneme existujúci zoznam z lokálnej pamäte
        const stored = await AsyncStorage.getItem('laria_contacts');
        let contacts = stored ? JSON.parse(stored) : [];

        // 2. Skontrolujeme, či už náhodou majstra v zozname nemáš
        const exists = contacts.find(c => c.id === newContact.id);
        
        if (exists) {
          Alert.alert("Systém LARIA", "Tento majster už je vo tvojom reťazci.");
          return;
        }

        // 3. Pridáme nového majstra (predvolene nepripnutý a neoverený)
        contacts.push({ 
          ...newContact, 
          pinned: false, 
          isVerified: false 
        });

        // 4. Uložíme späť do "digitálneho betónu" (AsyncStorage)
        await AsyncStorage.setItem('laria_contacts', JSON.stringify(contacts));

        // 5. Potvrdenie pre užívateľa a skok do vizitkára
        Alert.alert(
          "Spojenie nadviazané", 
          `${newContact.name} bol pridaný do tvojich kontaktov.`,
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Contacts') 
            }
          ]
        );
      }
    } catch (error) {
      console.error("Chyba v kyber-prenose:", error);
      Alert.alert("Error", "Dáta sa nepodarilo dešifrovať.");
    }
  };

  return (
    <View style={G.bg}>
      {/* Kybernetický status bar */}
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <WebView 
        // Cache-busting cez timestamp pre čerstvosť dát
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1, backgroundColor: '#000' }}
        startInLoadingState={true}
        
        // AKTIVÁCIA MOSTA:
        onMessage={handleMessage}
        javaScriptEnabled={true}
        
        // Ošetrenie pádov
        renderError={(errorName) => <View style={G.bg} />}
      />
    </View>
  );
};

export default MainScreen;