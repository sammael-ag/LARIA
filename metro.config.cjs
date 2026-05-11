const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Rozšírime koncovky (to si tam mal dobre, necháme to)
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// 2. ⚡️ KĽÚČOVÝ ZÁSAH: Povieme Metru, aby uprednostňovalo webové rozhranie
// Toto zabráni tomu, aby hľadal "main..bundle" pre natívne platformy
config.resolver.platforms = ['web', 'ios', 'android'];

module.exports = config;