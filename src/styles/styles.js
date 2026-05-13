import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const ACCENT = '#c5a059'; // Tvoja mosadzná/zlatá duša
const BG = '#1a1a1a';    // Hlboký antracit
const CARD_BG = '#242424'; // Mierne svetlejšia pre hĺbku

export const G = StyleSheet.create({
  // --- ZÁKLADNÁ ARCHITEKTÚRA (Hrubá stavba) ---
  mainBackground: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollPadding: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 20,
    alignItems: 'center',
    backgroundColor: BG,
  },

  // --- TYPOGRAFIA (Art Deco Vibe) ---
  monoIdentity: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 12,
    letterSpacing: 2, // Trošku viac vzduchu pre eleganciu
    color: ACCENT,
    opacity: 0.8,
  },
  atelierTitle: {
    fontSize: clamp(24, 32, 42), // Aby to na webe aj mobile lícovalo
    fontWeight: '300',
    color: ACCENT,
    letterSpacing: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginVertical: 20,
  },
  statusTextSmall: {
    color: '#e0e0e0',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  // --- OBJEKTY: KARTY A MODULY (Tvoj nábytok) ---
  card: {
    backgroundColor: CARD_BG,
    width: '100%',
    maxWidth: 500, // Trošku širšia pre web
    padding: 20,
    borderRadius: 2, // Ostrejšie hrany pre industriálny Art Deco štýl
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4, 
    borderLeftColor: ACCENT, // Ten tvoj farebný akcent
    marginBottom: 15,
    ...Platform.select({
      web: { boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.6)' },
      android: { elevation: 10 },
      ios: { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 15 }
    }),
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitleText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cardDescriptionText: {
    color: '#999',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },

  // --- INTERAKCIA (Tlačidlá a Vstupy) ---
  primaryBtn: {
    borderWidth: 1,
    borderColor: ACCENT,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 0, // Úplne ostré hrany - purizmus
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  primaryBtnText: {
    color: ACCENT,
    fontWeight: 'bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  vaultInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    padding: 15,
    fontSize: 16,
    borderRadius: 0, 
    marginBottom: 12,
    width: '100%',
    fontFamily: Platform.select({ web: 'monospace', android: 'monospace' }),
  },

  // --- DOPLNKY (Detaily, ktoré robia majstra) ---
  identityBar: {
    width: '100%',
    padding: 12,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  sectionDivider: {
    marginVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    width: '100%',
    alignItems: 'center',
  },
  sectionDividerText: {
    color: '#444',
    fontSize: 9,
    letterSpacing: 5,
    backgroundColor: BG,
    paddingHorizontal: 15,
    top: 7,
    textTransform: 'uppercase',
  },
  
  // --- MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.97)',
    justifyContent: 'center',
    padding: 30,
  },
  modalTitle: {
    color: ACCENT,
    fontSize: 20,
    letterSpacing: 5,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '300',
    textTransform: 'uppercase',
  }
});

// Pomocná funkcia pre citlivú veľkosť písma
function clamp(min, val, max) {
    return Math.max(min, Math.min(val, max));
}