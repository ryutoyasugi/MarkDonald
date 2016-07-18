var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var mainWindow = null;

/**
 * main process
 */
app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 960, height: 594 });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});
