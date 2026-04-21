import React from 'react';
import { View, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { G } from '../styles/styles'; 

const MainScreen = () => {
  return (
    <View style={G.bg}>
      {/* Status bar ostáva v tme, nech nekazí estetiku */}
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <WebView 
        // Vždy čerstvé dáta cez timestamp
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1, backgroundColor: '#000' }}
        startInLoadingState={true}
        // Tu môžeme neskôr pridať komunikáciu medzi Webom a Appkou (injectJavaScript)
        // Keď užívateľ v appke klikne na "Pridať", web pošle signál do tvojho LARIA chainu
      />
    </View>
  );
};

export default MainScreen;