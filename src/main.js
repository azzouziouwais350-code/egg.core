const { app, BrowserWindow } = require('electron');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/../node_modules/electron`)
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 860,
    minWidth: 360,
    minHeight: 600,
    backgroundColor: '#080710',
    autoHideMenuBar: true,
    title: 'EggTimer — Dreamcore Pixel Fusion',
    webPreferences: {
      // L'interface n'a pas besoin de Node : on isole le rendu (plus sûr).
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
}

app.whenReady().then(createWindow);