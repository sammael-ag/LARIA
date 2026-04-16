import React from 'react';
import { View, StatusBar, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

const MainScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" hidden={false} />
      <WebView 
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1 }}
        startInLoadingState={true}
        onShouldStartLoadWithRequest={(request) => {
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