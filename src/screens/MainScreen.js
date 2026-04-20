import React from 'react';
import { View, StatusBar, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchGMatrix } from '../services/GMatrixService';

// Import z našej operačnej pamäte (LARIA/styles/styles.js)
import { G } from '../styles/styles'; 

const MainScreen = () => {
  return (
    <View style={G.bg}>
      {/* Kybernetický status bar - svetlé ikony na tmavom pozadí */}
      <StatusBar barStyle="light-content" hidden={false} backgroundColor="#000" />
      
      <WebView 
        // Cache-busting cez timestamp, aby si vždy videl najnovšiu verziu webu
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1, backgroundColor: '#000' }} // Webview pozadie ladené do tmy
        startInLoadingState={true}
        onShouldStartLoadWithRequest={(request) => {
          // Logika pre externé linky (telefón, mail, telegram)
          if (['tel:', 'mailto:', 't.me'].some(proto => request.url.startsWith(proto))) {
            Linking.openURL(request.url);
            return false;
          }
          return true;
        }}
      />
    </View>
  );
};

export default MainScreen;