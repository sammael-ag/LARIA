import React from 'react';
import { View, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { G } from '../styles/styles'; 

const MainScreen = ({ navigation }) => {

  // --- MOSTE MEDZI WEBOM A LOKÁLNYM JADROM ---
  const handleMessage = async (event) => {
    try {
      // Rozbalíme dáta prichádzajúce z hlbín tvojho GitHub portálu
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ADD_CONTACT') {
        const payload = data.payload;

        // 1. Vytiahneme reťazec z digitálneho betónu
        const stored = await AsyncStorage.getItem('laria_contacts');
        let contacts = stored ? JSON.parse(stored) : [];

        // 2. Kontrola duplicity podľa ID alebo SHA
        const exists = contacts.find(c => c.id === payload.id || (payload.sha && c.sha === payload.sha));
        
        if (exists) {
          Alert.alert("SYSTÉM LARIA", "Tento majster už je súčasťou tvojho reťazca.");
          return;
        }

        // 3. MAPOVANIE NA ŠTANDARD v8.0 (meno, kat, lok)
        const newContact = { 
          id: payload.id || Date.now().toString(),
          meno: payload.meno || payload.name || "Neznámy Pútnik", 
          kat: payload.kat || payload.cat || "Majster",
          lok: payload.lok || payload.loc || "Matrix",
          tel: payload.tel || "",
          email: payload.email || "",
          krypt: payload.krypt || payload.revo || "",
          pinned: false, 
          isVerified: false,
          v: "8.0" 
        };

        contacts.push(newContact);

        // 4. Zápis do pamäte
        await AsyncStorage.setItem('laria_contacts', JSON.stringify(contacts));

        // 5. Potvrdenie a skok do vizitkára
        Alert.alert(
          "[ SPOJENIE NADVIAZANÉ ]", 
          `${newContact.meno} bol úspešne vtiahnutý do tvojej siete.`,
          [
            { 
              text: "[ OTTVORIŤ VIZITKÁR ]", 
              onPress: () => navigation.navigate('Contacts') 
            },
            {
              text: "[ ZOSTAŤ TU ]",
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error("Chyba v kyber-prenose:", error);
      Alert.alert("SYSTEM ERROR", "Dáta z webu sa nepodarilo dešifrovať.");
    }
  };

  return (
    <View style={G.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <WebView 
        // Timestamp zabezpečí, že sa vždy načíta najčerstvejšia verzia tvojho umenia
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1, backgroundColor: '#000' }}
        startInLoadingState={true}
        
        // MOSTE AKTÍVNY
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        
        // Ošetrenie pádov bez rušivých elementov
        renderError={() => <View style={G.bg} />}
      />
    </View>
  );
};

export default MainScreen;