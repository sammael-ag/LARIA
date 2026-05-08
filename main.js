import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'is-dev';

// Pomôcka pre cesty v modernom JS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // Sammael, tu nalaďujeme na Expo
    win.loadURL('http://localhost:8081');
  } else {
    win.loadFile(path.join(__dirname, 'web-build/index.html'));
  }

  // Ak sa to hneď nenačíta, skúsime to znova (Expo niekedy štartuje dlho)
  win.webContents.on('did-fail-load', () => {
    if (isDev) {
      console.log("🔄 Expo ešte spí, skúšam znova...");
      setTimeout(() => win.loadURL('http://localhost:8081'), 5000);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});