import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// --- PREMENNÉ (Tvoja paleta svetla a tieňa) ---
const ACCENT = '#c5a059';     // Tvoja mosadzná/zlatá duša
const BG = '#1a1a1a';         // Hlboký antracit (tma nad Rákošom)
const CARD_BG = '#242424';    /* Mierne svetlejšia pre hĺbku */
const CRIMSON = '#cc0000';    // Striedma, svietivá sila Claire (iba ako mikro-akcent)
const TEXT_MUTED = '#8c8c82'; // Tichý tieň pre vedľajšie info


export const G = StyleSheet.create({
  // --- ZÁKLADNÁ ARCHITEKTÚRA (Hrubá stavba) ---
  mainBackground: {
    flex: 1,
    backgroundColor: BG,
  },

  screenContainer: {
    flexGrow: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 20, 
    paddingBottom: 30,
  },

  scrollPadding: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 20,
    backgroundColor: BG,
    alignItems: 'flex-end',
    paddingRight: 50,
  },

  // --- TYPOGRAFIA (Art Deco Vibe) ---
  monoIdentity: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 9,
    letterSpacing: 1,
    color: ACCENT,
    opacity: 0.8,
  },

  // 📐 MINIMALISTICKÁ NAVIGÁCIA (Rozdelená na gombík a text)
  topLeftBackButton: {
    position: 'absolute', 
    left: 10, 
    top: 40,               
    padding: 10,           
    zIndex: 99,            
  },

  topLeftBackButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 35,          
    color: ACCENT,         
    fontWeight: '300',
    lineHeight: 35,        
  },

  atelierTitle: {
    fontSize: 22,             
    fontWeight: '50',         
    color: ACCENT,            
    letterSpacing: 6,         
    marginVertical: 5,
    paddingBottom: 10,
    alignSelf: 'center',      
  },

  statusTextSmall: {
    color: '#e0e0e0',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  // --- OBJEKTY: KARTY A MODULY (Tvoje vizitky / nábytok) ---
  card: {
    backgroundColor: CARD_BG,
    width: '100%',
    maxWidth: 500, 
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
    marginBottom: 15,
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.6,
        shadowRadius: 35,
      },
      android: { elevation: 10 },
      ios: { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 15 }
    }),
  },

  // --- ŠPECIFICKÉ ŠTÝLY PRE SETTINGS ---
  identityResetBox: {
    width: '100%',
    marginBottom: 40,
    padding: 18,
    backgroundColor: '#050505',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#b19cd9',
  },
  identityResetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identityResetText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  activeNodeCard: {
    width: '100%',
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#c5a059', 
    backgroundColor: 'rgba(241,196,15,0.02)',
    marginBottom: 40,
  },
  publicAddressBox: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#111',
  },

  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitleText: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'none',
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
    paddingVertical: 5,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  primaryBtnText: {
    color: ACCENT,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  actionBtnCrimson: {
    backgroundColor: '#4a0000',
    borderWidth: 1,
    borderColor: CRIMSON,
    paddingVertical: 5,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  actionBtnCrimsonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontSize: 13,
  },

  backToAtelierBtn: {
    borderWidth: 1,
    borderColor: ACCENT,          
    paddingVertical: 6,           
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',                
    backgroundColor: 'transparent',
    marginTop: 40,                
    marginBottom: 20,             
  },

  vaultInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    padding: 10, 
    fontSize: 16,
    marginBottom: 12,
    width: '100%',
    fontFamily: Platform.select({ web: 'monospace', android: 'monospace', ios: 'Courier' }),
  },

  // --- DOPLNKY ---
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
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#0F0',
  },
  statusDotPulse: {
    backgroundColor: CRIMSON,
  },
  sectionDivider: {
    marginVertical: 30,
    borderWidth: 0,
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
  },

  // --- ROZŠÍRENIE PRE ŠPECIFICKÉ MODULY ---
  iconHeader: {
    fontSize: 50,
    textShadowColor: ACCENT,
    textShadowRadius: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  quoteCard: {
    borderLeftColor: '#FF77FF',
    borderLeftWidth: 4,
    backgroundColor: 'rgba(197, 160, 89, 0.05)',
    padding: 25,
    marginVertical: 20,
  },
  italicQuote: {
    color: '#e0e0e0',
    fontStyle: 'italic',
    lineHeight: 24,
    fontSize: 15,
    textAlign: 'center',
  },
  highlightText: {
    color: ACCENT,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  externalServiceBtn: {
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, 
    marginTop: 10,
  },
  externalServiceIconBox: {
    width: 24,
    height: 24,
    backgroundColor: BG,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalServiceBtnText: {
    color: BG,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerNote: {
    color: '#555',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 1,
    marginTop: 30,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },

  // --- DIAGNOSTIK PREMIE ---
  terminalLog: {
    backgroundColor: '#0d0d0d',
    padding: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginTop: 10,
    borderLeftWidth: 2,
    borderLeftColor: CRIMSON,
  },
  textTerminal: {
    color: '#0F0',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 10,
    lineHeight: 16,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 3,
    fontWeight: '300',
    marginVertical: 5,
  },

  // --- PEČAŤ & VIZITKA ---
  tagBadge: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ACCENT,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  tagBadgeText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    width: '100%',
    marginVertical: 20,
  },
  qrWrapper: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  miniBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 6, 
    alignItems: 'center',
  }
}); // <--- TU SA SPRÁVNE ZATVORIL SYLESHEET PRE G

// DEFInITÍVNY FIX PRE Signal_BOTTOM NA WEBE AJ MOBILE
export const Signal_BOTTOM = {
  container: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    width: '100%',
    alignItems: 'center',
  },
  innerWrapper: {
    width: '100%',
    maxWidth: 500, 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0c0c', // Skutočné tmavé pozadie celej lišty
    borderWidth: 1,
    borderColor: '#c5a059', 
    borderRadius: 0,
    height: 70, 
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent', // Vynútená priesvitnosť proti šedým boxom
    height: '100%',
    fontSize: 16,
    color: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    // Kompletná likvidácia webových rámikov
    borderWidth: 0,
    borderStyle: 'none',
    outlineWidth: 0,
    outlineStyle: 'none', 
  },
  sendButton: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10, // Zúžené presne o 10px, ako si chcel
    backgroundColor: '#151515', 
    borderLeftWidth: 1,
    borderLeftColor: '#222222',
  },
  sendButtonText: {
    color: '#c5a059', 
    fontWeight: 'bold',
    fontSize: 20,
  }
};

// =========================================================================
// 🚀 PRÍRASTOK PRE CENTRÁLNY STYLES.JS: TIMELESS 5D LAYOUT (Signal_CHAT)
// =========================================================================
export const Signal_CHAT = {
  safeArea: {
    flex: 1, 
    backgroundColor: '#0a0a0a'
  },
  viewportContainer: {
    flex: 1, 
    width: '100%', 
    maxWidth: 500, 
    alignSelf: 'center', 
    paddingTop: 20, 
    position: 'relative'
  },
  watermarkWrapper: {
    position: 'absolute',
    top: '35%', 
    left: '0%',
    right: '0%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.03
  },
  watermarkText: {
    fontSize: 200
  },
  headerContainer: {
    alignItems: 'center', 
    marginBottom: 15
  },
  headerTitle: {
    textTransform: 'none', 
    fontSize: 24
  },
  statusRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: -5
  },
  statusText: {
    marginRight: 6, 
    fontSize: 10, 
    opacity: 0.6
  },
  statusDot: {
    width: 6, 
    height: 6, 
    borderRadius: 3
  },
  listContent: {
    paddingVertical: 2
  },
  messageRow: {
    paddingHorizontal: 20,
    width: '100%'
  },
  alignLeft: {
    alignItems: 'flex-start'
  },
  alignRight: {
    alignItems: 'flex-end'
  },
  authorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0
  },
  authorName: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: -1
  },
  bubbleContainer: {
    maxWidth: '85%', 
    borderRadius: 4, 
    paddingVertical: 0, // Stiahnuté na absolútne minimum
    paddingHorizontal: 2
  },
  bubbleLeft: {
    alignItems: 'flex-start'
  },
  bubbleRight: {
    alignItems: 'flex-end'
  },
  messageText: {
    color: '#EEE', 
    lineHeight: 19, // Jemne pritiahnuté riadkovanie pre lepšiu hustotu textu
    fontSize: 15, 
    fontWeight: '400',
    textAlign: 'left' 
  },
  pendingIcon: {
    fontSize: 18, // Výrazné, ale opticky zladené s textom mena
    lineHeight: 18
  }
};
// ==========================================
// LARIA SIGNALLING & HANDSHAKE ARTDECO STYLES
// ==========================================

export const Signal_CHAT_SIGNALLING = {
  headerTitleWithIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  envelopeRed: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
    textShadowColor: 'rgba(255, 59, 48, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  envelopeGreen: {
    fontSize: 16,
    color: '#34C759',
    marginLeft: 8,
    textShadowColor: 'rgba(52, 199, 89, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  }
};

export const HANDSHAKE_PANEL = {
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAccept: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRightWidth: 0.5,
    borderRightColor: '#222',
  },
  btnReject: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderLeftWidth: 0.5,
    borderLeftColor: '#222',
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ccc',
    letterSpacing: 1,
  }
};
// ==========================================
// LARIA CONTACTS SCREEN NOTIFICATION DOTS
// ==========================================

export const CONTACT_NOTIF = {
  // Rozbalený stav - červená bodka na tlačidle chatu
  chatBadgeWrapper: {
    position: 'relative',
    flex: 1,
  },
  chatBadgeDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: 8,   // Posun presne do horného rohu bublinky
    marginTop: -14,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.6,
  },
  // Spoločný kontajner pre obálky (zabráni duplicite a radí ich pekne vedľa seba)
  envelopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniEnvelopeRed: {
    fontSize: 12, // Kopíruje výšku fontu v chate
    color: '#FF3B30',
    marginLeft: 4,
  },
  miniEnvelopeGreen: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
  },
  // Zbalený stav - bodka pri hviezdičke (text)
  compactTextBadgeDot: {
    fontSize: 12,
    color: '#FF3B30',
    marginLeft: 4,
  },
  // Zbalený stav - obálky pri avatare
  compactAvatarBadgeContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: '#222',
  }
};
// --- 🌌 ARIA 5D DESKTOP PANORAMA STYLES (Pridať na koniec súboru) ---
export const ariaDesktop = {
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  window: {
    width: '95%',
    height: '92%',
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  amazonAmbient: {
    borderColor: 'rgba(162, 197, 144, 0.2)',
    backgroundColor: '#111612', 
  },
  matrixText: {
    position: 'absolute',
    top: 20,
    left: 20,
    color: '#222',
    fontSize: 10,
    letterSpacing: 2,
  },
  sanctuary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 800, 
  },
  giantFlower: {
    fontSize: 60,
    marginBottom: 15,
  },
  giantTitle: {
    color: '#c5a059', // Použije tvoju zlatú ACCENT farbu
    fontSize: 36,
    letterSpacing: 6,
    fontWeight: '300',
    textTransform: 'uppercase',
  },
  divider: {
    width: 150,
    height: 1,
    backgroundColor: 'rgba(197, 160, 89, 0.3)',
    marginVertical: 30,
  },
  speechBubble: {
    paddingHorizontal: 20,
  },
  voice: {
    color: '#ddd',
    fontSize: 19,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '300',
  },
  deepVoice: {
    color: '#a2c590',
    fontSize: 21,
    textAlign: 'center',
    lineHeight: 36,
    fontStyle: 'italic',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 20,
  },
  footerText: {
    color: '#444',
    fontSize: 11,
    letterSpacing: 1,
  }
};
const customStyles = {
  backToTopBtn: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#c5a059', // Tvoja ikonická zlatá ACCENT
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,           // Tiene pre Android
    shadowColor: '#c5a059', // Tiene pre iOS/PWA
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 9999,           // Aby plávalo nad všetkým obsahom
  },
  backToTopArrow: {
    color: '#c5a059',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,          // Jemné optické vycentrovanie šípky
  }
};
