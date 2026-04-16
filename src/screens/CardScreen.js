import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const CardScreen = () => {
  return (
    <View style={UI.container}>
      {/* Hlavná Vizitka - Artefakt */}
      <View style={UI.cardFrame}>
        <View style={UI.cardInner}>
          <Image 
            source={require('../../assets/cyber-pechat.jpeg')} 
            style={UI.pechatSmall}
          />
          <Text style={UI.nameText}>SAMMAEL</Text>
          <Text style={UI.roleText}>CARPENTER | MULTIDIMENSIONAL ARTIST</Text>
          
          <View style={UI.divider} />
          
          <Text style={UI.locationText}>RÁKOŠ | SLOVAKIA</Text>
        </View>
      </View>

      {/* QR Kód - Brána (zatiaľ placeholder) */}
      <View style={UI.qrContainer}>
        <View style={UI.qrPlaceholder}>
          <Text style={UI.qrText}>[ QR GATEWAY ]</Text>
        </View>
        <Text style={UI.scanHint}>KLIKNI PRE SKENOVANIE</Text>
      </View>

      {/* Spodné menu pre zdieľanie */}
      <View style={UI.actionRow}>
        <TouchableOpacity style={UI.circleBtn}>
          <Text style={UI.btnIcon}>🔗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={UI.circleBtn}>
          <Text style={UI.btnIcon}>📲</Text>
        </TouchableOpacity>
        <TouchableOpacity style={UI.circleBtn}>
          <Text style={UI.btnIcon}>💾</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const UI = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardFrame: {
    width: width * 0.85,
    height: 480,
    borderWidth: 1,
    borderColor: '#333',
    padding: 2,
    borderRadius: 20,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#050505',
    borderRadius: 18,
    alignItems: 'center',
    padding: 30,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#111',
  },
  pechatSmall: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 40,
    opacity: 0.9,
  },
  nameText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  roleText: {
    color: '#666',
    fontSize: 10,
    marginTop: 10,
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  divider: {
    width: '40%',
    height: 1,
    backgroundColor: '#FFF',
    marginVertical: 30,
    opacity: 0.2,
  },
  locationText: {
    color: '#444',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  qrContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    color: '#222',
    fontSize: 10,
  },
  scanHint: {
    color: '#333',
    fontSize: 9,
    marginTop: 10,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 50,
    width: '100%',
    justifyContent: 'space-evenly',
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#080808',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#151515',
  },
  btnIcon: {
    fontSize: 20,
  }
});

export default CardScreen;