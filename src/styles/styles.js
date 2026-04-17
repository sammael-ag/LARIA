import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const G = StyleSheet.create({
  // --- ZÁKLADNÉ ARCHITEKTONICKÉ PRVKY ---
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
    paddingTop: 60,
  },

  // --- TEXTOVÉ ŠTANDARDY (Koniec neviditeľných písmen) ---
  mono: {
    fontFamily: 'monospace',
  },
  textMain: {
    color: '#DDD', // Svetlá sivá (dobre čitateľná)
    fontFamily: 'monospace',
    fontSize: 14,
  },
  textDim: {
    color: '#888', // Viditeľná sivá pre popisy
    fontFamily: 'monospace',
    fontSize: 11,
  },
  textCyber: {
    color: '#0F0', // SPDR Green
    fontFamily: 'monospace',
  },
  textWhite: {
    color: '#FFF',
    fontFamily: 'monospace',
  },

  // --- OBJEKT: KARTA / VIZITKA ---
  card: {
    backgroundColor: '#111',
    width: '100%',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
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
    backgroundColor: '#0F0',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  ircButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  // --- IRC / TERMINÁL ŠPECIFIKÁ ---
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#111',
    alignItems: 'center',
    backgroundColor: '#050505',
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
  },
  msgContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  msgTime: {
    color: '#666', // Konečne viditeľný čas
    fontFamily: 'monospace',
    fontSize: 10,
    marginRight: 8,
  },

  // --- HLAVIČKY (Zjednotené) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#0F0',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 2,
  },

  // --- SPLASH ŠPECIÁL ---
  pechat: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 15,
    marginBottom: 30,
  },
  lariaTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowRadius: 20,
    fontFamily: 'monospace',
  }
});