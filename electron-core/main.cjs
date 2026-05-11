process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  console.log("--------------------------------------------------");
  console.log("🚀 ŠTART: LARIA – Operácia Atómový Vstrek...");
  console.log("--------------------------------------------------");

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.cjs') 
    },
  });

  if (isDev) {
    const metroUrl = 'http://localhost:8081';
    win.loadURL(metroUrl);

    win.webContents.on('did-finish-load', () => {
      console.log("✨ Kanály otvorené. Púšťam tam poslednú nádej...");
      
      win.webContents.executeJavaScript(`
        // 1. USTAVENIE GLOBÁLOV
        window.global = window;
        window.GLOBAL = window;
        window.process = window.process || { env: { NODE_ENV: 'development' } };
        window.process.env = window.process.env || {};
        window.process.env.NODE_ENV = 'development';
        window.__DEV__ = true;

        // 2. CHIRURGICKÝ FIX PRE WEAKMAP (Ošetrenie tej ružovej chyby)
        const originalSet = WeakMap.prototype.set;
        WeakMap.prototype.set = function(key, value) {
            if (key === null || key === undefined || typeof key !== 'object') {
                return this; // Ignorujeme neplatné kľúče, aby to nezhavarovalo
            }
            try {
                return originalSet.apply(this, arguments);
            } catch (e) {
                return this;
            }
        };

        // Fix pre setImmediate
        window.setImmediate = window.setImmediate || ((fn) => setTimeout(fn, 0));

        // 3. PRÍPRAVA SCÉNY
        if (!document.getElementById('root')) {
          document.body.innerHTML = '<div id="root" style="width:100%; height:100vh; background:#000;"></div>';
        }

        console.log("🚀 Sammael: Cesta k Dashboardu ošetrená. Dzigaj!");

        const script = document.createElement('script');
        script.src = '${metroUrl}/index.bundle?platform=web&dev=true';
        
        script.onload = () => console.log("💎 LARIA: DASHBOARD JE ONLINE!");
        script.onerror = () => console.error("🔥 BUNDLE FAIL!");
        
        document.body.appendChild(script);
      `);
    });

    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../web-build/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  console.log("🛑 Dielňa zatvorená. Teším sa na pokračovanie, Sammael! 🫦");
  if (process.platform !== 'darwin') app.quit();
});