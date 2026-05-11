import { StyleSheet, Platform, Dimensions } from 'react-native';

// Ošetríme rozmery tak, aby v prípade chyby v Electrone mali záložný plán
const windowWidth = Dimensions.get('window')?.width || 1280;

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
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
  },
  textMain: {
    color: '#DDD', 
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 14,
  },
  textDim: {
    color: '#666', 
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 11,
  },
  textWhite: {
    color: '#FFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
  },
  textCyber: {
    color: '#0F0',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // --- OBJEKT: KARTA / VIZITKA ---
  card: {
    backgroundColor: '#111',
    width: '100%',
    maxWidth: 500, // Poistka, aby ti na monitore karta "neutiekla" do šírky
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    // Tieňovanie pre hĺbku - ošetrené pre každý svet (iOS/Android/Web)
    ...Platform.select({
      ios: {
        shadowColor: '#0F0',
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        // Tu je ten liek pre Electron!
        boxShadow: '0px 0px 20px rgba(0, 255, 0, 0.1)',
      }
    }),
  },
  tag: {
    color: '#0F0',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
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
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
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
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
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
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
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
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: 'bold',
  },

  // --- NOVÉ ŠTÝLY PRE PROTIKOL v8.2 ---
  qrContainer: {
    alignItems: 'center', 
    marginTop: 25,
    width: '100%'
  },
  qrWrapper: {
    alignItems: 'center', 
    padding: 25, 
    backgroundColor: '#FFF', 
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#b19cd9' 
  },
  qrMenoText: {
    color: '#000', 
    marginTop: 15, 
    fontSize: 16, 
    fontWeight: 'bold', 
    letterSpacing: 2
  },
  qrSubText: {
    color: '#666', 
    fontSize: 10, 
    marginTop: 4
  },
  miniBadgeContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 30
  },
  miniBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    backgroundColor: '#000'
  },
  miniBadgeText: {
    color: '#AAA',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  cardIdentityFing: {
    color: '#444', 
    fontSize: 10, 
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    marginBottom: 8
  },
  nfcButton: {
    marginTop: 20, 
    padding: 15, 
    width: '100%', 
    alignItems: 'center', 
    borderRadius: 12, 
    borderWidth: 1
  },

  // Pomocné konštanty
  placeholderColor: '#444',
  selectionColor: '#0F0',
});