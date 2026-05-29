const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Povieme Metru, aby si nevšímalo zložku src-tauri a jej vnútro (Ochrana pre Tauri okno)
config.resolver.blacklistRE = /src-tauri\/.*/;
config.resolver.blockList = /src-tauri\/.*/;

// Fix pre GitHub Pages podadresár (/LARIA)
// Ak beží produkčný export, Metro správne nastaví cestu pre statické súbory
if (process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS) {
  config.transformer = {
    ...config.transformer,
    publicPath: '/LARIA/_expo/static',
  };
}

module.exports = config;