import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const G = StyleSheet.create({
  // --- ZÁKLADNÁ ARCHITEKTÚRA ---
  bg: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgDashboard: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 45 : 20,
  },

  // --- TEXTOVÉ ŠTANDARDY ---
  mono: {
    fontFamily: 'monospace',
  },
  textMain: {
    color: '#DDD', 
    fontFamily: 'monospace',
    fontSize: 14,
  },
  textDim: {
    color: '#666', 
    fontFamily: 'monospace',
    fontSize: 11,
  },
  textWhite: {
    color: '#FFF',
    fontFamily: 'monospace',
  },
  textCyber: {
    color: '#0F0',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // --- OBJEKT: KARTA / VIZITKA (Ten tvoj obľúbený look) ---
  card: {
    backgroundColor: '#111',
    width: '100%',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    // Tieňovanie pre hĺbku
    shadowColor: '#0F0',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tag: {
    color: '#0F0',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20,
    width: '100%',
  },

  // --- TLAČIDLÁ A INTERAKCIA ---
  btnAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
  },
  btnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  ircButton: {
    borderWidth: 1,
    borderColor: '#0F0',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  ircButtonText: {
    color: '#0F0',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // --- FORMULÁROVÉ VSTUPY (Editor) ---
  terminalInput: {
    backgroundColor: '#080808',     
    borderWidth: 1,
    borderColor: '#222',          
    color: '#CCC',                
    padding: 12,
    fontSize: 15,
    borderRadius: 6,              
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 15,
    marginTop: 5,
  },

  // --- HLAVIČKY ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFF',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: 'bold',
  },

  // Pomocné konštanty
  placeholderColor: '#444',
  selectionColor: '#0F0',
});