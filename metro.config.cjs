const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Povieme Metru, aby si nevšímalo zložku src-tauri a jej vnútro (Ochrana pre Tauri okno)
config.resolver.blacklistRE = /src-tauri\/.*/;
config.resolver.blockList = /src-tauri\/.*/;

module.exports = config;