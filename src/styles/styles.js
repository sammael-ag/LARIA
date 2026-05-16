import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// --- PREMENNÉ (Tvoja paleta svetla a tieňa) ---
const ACCENT = '#c5a059';     // Tvoja mosadzná/zlatá duša
const BG = '#1a1a1a';         // Hlboký antracit (tma nad Rákošom)
const CARD_BG = '#242424';    /* Mierne svetlejšia pre hĺbku */
const CRIMSON = '#cc0000';    // Striedma, svietivá sila Claire (iba ako mikro-akcent)
const TEXT_MUTED = '#8c8c82'; // Tichý tieň pre vedľajšie info

// Pomocná funkcia pre citlivú veľkosť písma (musí byť navrchu)
function clamp(min, val, max) {
  return Math.max(min, Math.min(val, max));
}

// Dynamický výpočet pre nadpis podľa šírky obrazovky
const calculatedTitleSize = clamp(24, width * 0.05, 42);

export const G = StyleSheet.create({
  // --- ZÁKLADNÁ ARCHITEKTÚRA (Hrubá stavba) ---
  mainBackground: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollPadding: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 20,
    backgroundColor: BG,
    /* 📐 ZMENA: Namiesto centrovania ('center') tlačíme všetky objekty doprava */
    alignItems: 'flex-end',
    /* Odsadenie 50px od pravého okraja monitora */
    paddingRight: 50,
  },

  // --- TYPOGRAFIA (Art Deco Vibe) ---
  monoIdentity: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 12,
    letterSpacing: 2,
    color: ACCENT,
    opacity: 0.8,
  },
  atelierTitle: {
    fontSize: calculatedTitleSize,
    fontWeight: '300',
    color: ACCENT,
    letterSpacing: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginVertical: 20,
    /* Aby nadpis ostal centrovaný cez celý pravý blok, ak je v ňom obalený */
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
    maxWidth: 500, /* Držíme pevnú šírku vizitky, takže vpravo vytvoria čistý stĺpec */
    padding: 20,
    borderRadius: 0, /* Striktne ostré hrany - purizmus */
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
    /* 📐 ÚPRAVA: Zoštíhlené na čistých 5 pre prirodzenú, natučenú výšku tlačidla bez !important */
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 0,
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  primaryBtnText: {
    color: ACCENT,
    fontWeight: 'bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  actionBtnCrimson: {
    backgroundColor: '#4a0000',
    borderWidth: 1,
    borderColor: CRIMSON,
    /* 📐 ÚPRAVA: Zosúladené na 5 aj tu, nech to v Dashboarde krásne lícuje */
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 0,
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
  vaultInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    padding: 10, /* Prispôsobené k novým nízkym tlačidlám */
    fontSize: 16,
    borderRadius: 0,
    marginBottom: 12,
    width: '100%',
    fontFamily: Platform.select({ web: 'monospace', android: 'monospace', ios: 'Courier' }),
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
    borderRadius: 0,
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
    paddingVertical: 10, /* Jemné zoštíhlenie */
    borderRadius: 0,
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
    borderRadius: 0,
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
    paddingVertical: 6, /* Zoštíhlené mini gombíky pre dokonalý detail */
    alignItems: 'center',
  }
});