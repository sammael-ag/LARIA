// electron-core/preload.cjs

// Natvrdo mu podhodíme, čo chce, ale bez zbytočných zámkov
window.process = process;
window.process.env = {
    ...process.env,
    NODE_ENV: 'development',
    __DEV__: true
};
window.global = window;

console.log("🛠️ Sammael, káva č.4 dopitá? Pásik ešte drží! 🫦");