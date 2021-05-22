'use strict';
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const storage = require('electron-json-storage');
const {version} = require('./package.json');
const process = require('process');
const AmongUsMods = require("./src/server");


let mainWindow;
let dev = false; // Determine the mode (dev or production)
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
    dev = true;
}// Temporary fix for broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
    app.commandLine.appendSwitch('high-dpi-support', 'true');
    app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 500, // width of the window
        height: 750, // height of the window
        show: false, // don't show until window is ready
        frame: false,
        resizable: false,
        transparent: false,
        title: "Among Us - Mods v" + version,
        icon: path.join(__dirname, 'src/assets/images/icon.png'),
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });  // and load the index.html of the app.
    mainWindow.removeMenu();

    mainWindow.on('page-title-updated', function (e) {
        e.preventDefault();
    });
    let indexPath;
    if (dev && process.argv.indexOf('--noDevServer') === -1) {
        indexPath = url.format({
            protocol: 'http:',
            host: 'localhost:8080',
            pathname: 'index.html',
            slashes: true
        })
    } else {
        indexPath = url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, 'dist', 'index.html'),
            slashes: true
        })
    }
    mainWindow.loadURL(indexPath);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (dev) {
            mainWindow.webContents.openDevTools();
        } else {
            //mainWindow.webContents.openDevTools();
        }
    });
    mainWindow.on('closed', function () {
        mainWindow = null
    });
}

const amongUsMods = new AmongUsMods(storage.getDataPath());

ipcMain.handle('close.app', async e => {
    mainWindow.close();
    app.quit();
});

ipcMain.handle('minimize.app', async e => {
    mainWindow.minimize();
});

ipcMain.handle('open.console', async e => {
    mainWindow.webContents.openDevTools();
});

amongUsMods.start();

app.on('ready', createWindow);
