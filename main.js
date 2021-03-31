'use strict';
const {app, BrowserWindow, ipcMain, dialog, globalShortcut, shell} = require('electron');
const path = require('path');
const url = require('url');
const fetch = require('electron-main-fetch');
const storage = require('electron-json-storage');
const {version} = require('./package.json');
const DownloadManager = require("electron-download-manager");
const fs = require('fs');
const unzipper = require("unzipper");
const {exec, execFile} = require('child_process');
const os = require ('os');
const gh = require('parse-github-url');
const lnk = require('lnk');
const psList = require('ps-list');
const process = require('process');


const VANILLA_FILES = ['Among Us_Data', 'Among Us.exe', 'GameAssembly.dll', 'UnityCrashHandler32.exe', 'UnityPlayer.dll', 'baselib.dll', 'UnityCrashHandler64.exe'];


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
        width: 400, // width of the window
        height: 600, // height of the window
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

ipcMain.on('storage.set', function (e, {key, value}) {
    storage.set(key, value, function (error) {
        if (error) throw error;
    });
    e.returnValue = 'received';
});

ipcMain.on('storage.get', function (e, {key}) {
    storage.get(key, function (error, data) {
        if (error || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
            e.returnValue = null;
        } else {
            e.returnValue = data;
        }
    });
});

function getStorage(key) {
    return new Promise(resolve => {
        storage.get(key, function (error, data) {
            if (error) {
                resolve(null);
            } else {
                resolve(data || {});
            }
        });
    });
}

function setStorage(key, value) {
    return new Promise(resolve => {
        storage.set(key, value, function (error) {
            if (error) {
                throw error;
            }
            resolve(true);
        });
    });
}

async function getMods() {
    const mods = await getStorage('mods');
    if(Array.isArray(mods)) {
        return mods;
    } else {
        return [];
    }
}

async function setMods(mods) {
    return await setStorage('mods', mods);
}

function getAmongUsInstallationFolderPath() {
    return new Promise(resolve => {
        storage.get('config', function (error, data) {
            resolve(data.amongUsFolder.replace('Among Us.exe', ''));
        });
    });
}

const dataPath = storage.getDataPath();
const downloadModsFolder = dataPath + '/mods-archives';
const modsFolder = dataPath + '/mods';

async function fetchGithubRelease(repo) {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases`);
    return await response.json();
}

ipcMain.handle('get.mods', async e => {
    return await getMods();
});

ipcMain.handle('update.config', async (e, {amongUsFilePath}) => {
    if(fs.existsSync(amongUsFilePath) && amongUsFilePath.endsWith('Among Us.exe')) {
        const folderPath = amongUsFilePath.replace('Among Us.exe', '');
        if(VANILLA_FILES.map(fileName => fs.existsSync(folderPath + fileName))) {
            await setStorage('config', {amongUsFolder: amongUsFilePath});
            return true;
        }
    } else {
        return false;
    }
});

ipcMain.handle('check.config', async e => {
    const config = await getStorage('config');
    return config.amongUsFolder && fs.existsSync(config.amongUsFolder);
});

ipcMain.handle('download.mod', (e, {url}) => {
    const github = gh(url);
    return new Promise(resolve => {
        fetchGithubRelease(github.repo).then(git => {
            const [asset] = git[0].assets.filter(a => a.browser_download_url.endsWith('.zip'));
            if(asset) {
                DownloadManager.download({
                    url: asset.browser_download_url,
                    onProgress: (progress) => {
                        //console.log(progress);
                        e.sender.send('download.mod.progress', progress);
                    }
                }, function (error, info) {
                    if (error) {
                        resolve(false);
                    } else {
                        fs.createReadStream(info.filePath)
                            .pipe(unzipper.Extract({path: modsFolder + '/' + github.repo}))
                            .on('entry', entry => entry.autodrain())
                            .promise().then(() => {
                            fs.promises.unlink(info.filePath).then(async () => {
                                const result = {
                                    repo: url,
                                    version: git[0].tag_name
                                }
                                const mods = await getMods();
                                mods.push(result);
                                await setMods(mods);
                                resolve(result);
                            });
                        });
                    }
                });
            }

        });
    });
});

ipcMain.handle('uninstall.mod', async (e, {url}) => {
    const github = gh(url);
    await fs.promises.rmdir(modsFolder + '/' + github.repo, { recursive: true });
    const mods = await getMods();
    for (const k in mods) {
        if(mods[k].repo === url) {
            mods.splice(k, 1);
            break;
        }
    }
    await setMods(mods);
    return url;
});

ipcMain.handle('update.mod', (e, {url}) => {
    const github = gh(url);
    return new Promise(resolve => {
        fetchGithubRelease(github.repo).then(git => {
            DownloadManager.download({
                url: git[0].assets[0].browser_download_url,
                onProgress: (progress) => {
                    //console.log(progress);
                    e.sender.send('download.mod.progress', progress);
                }
            }, function (error, info) {
                if (error) {
                    resolve(false);
                } else {
                    fs.promises.rmdir(modsFolder + '/' + github.repo, { recursive: true }).then(() => {
                        const rs = fs.createReadStream(info.filePath);
                        rs.pipe(unzipper.Extract({path: modsFolder + '/' + github.repo}))
                            .on('entry', entry => entry.autodrain())
                            .promise().then(() => {
                            fs.promises.unlink(info.filePath).then(async () => {
                                rs.close();
                                const result = {
                                    repo: url,
                                    version: git[0].tag_name
                                }
                                const mods = await getMods();
                                for (const k in mods) {
                                    if(mods[k].repo === result.repo) {
                                        mods[k].version = result.version;
                                    }
                                }
                                await setMods(mods);
                                resolve(result);
                            });
                        });
                    });
                }
            });
        });
    });
});

ipcMain.handle('get.installed.mods', async (e) => {
    if(!fs.existsSync(modsFolder)) {
        return [];
    } else {
        const folders = await fs.promises.readdir(modsFolder);
        return folders.map(folder => Number.parseInt(folder));
    }
});

function execCmd(command) {
    return new Promise(resolve => {
        exec(command, (error, data, getter) => {
            if(error){
                console.log("error",error.message);
                return;
            }
            if(getter){
                console.log("data",data);
                return;
            }
            console.log("data",data);
            resolve(true);
        });
    });
}

async function restoreVanillaAmongUs() {
    const amongUsFolder = await getAmongUsInstallationFolderPath();
    const files = await fs.promises.readdir(amongUsFolder);
    for (const file of files) {
        if(!VANILLA_FILES.includes(file)) {
            const filePath = amongUsFolder + file;
            if((await fs.promises.lstat(filePath)).isDirectory()) {
                await execCmd(`rmdir "${filePath}"`);
            } else {
                await fs.promises.unlink(filePath);
                //await execCmd(`rmdir "${filePath}"`);
            }
        }
    }
    return true;
}

ipcMain.handle('close.app', async e => {
    mainWindow.close();
    app.quit();
});

ipcMain.handle('minimize.app', async e => {
    mainWindow.minimize();
});

ipcMain.handle('play.mod', async (e, {url}) => {
    const github = gh(url);
    await restoreVanillaAmongUs();
    const folder = modsFolder + '/' + github.repo;
    const files = await fs.promises.readdir(folder);
    const amongUsFolder = await getAmongUsInstallationFolderPath();
    for (const fileName of files) {
        const filePath = `${folder}/${fileName}`;
        if((await fs.promises.lstat(filePath)).isFile()) {
            await lnk(`${folder}/${fileName}`, amongUsFolder);
            //await execCmd(`mklink "${amongUsFolder}${fileName}" "${folder}/${fileName}"`);
        } else {
            await lnk(`${folder}/${fileName}`, amongUsFolder);
            //await execCmd(`mklink /D "${amongUsFolder}${fileName}" "${folder}/${fileName}"`);
        }
    }
    execFile(amongUsFolder + 'Among Us.exe');
    return true;
});

ipcMain.handle('play.vanilla', async (e) => {
    await restoreVanillaAmongUs();
    const amongUsFolder = await getAmongUsInstallationFolderPath();
    execFile(amongUsFolder + 'Among Us.exe');
    return true;
});

ipcMain.handle('open.link', async (e, {link}) => {
    await shell.openExternal(link);
    return true;
});

ipcMain.handle('check.among-us.running', async e => {
    const openedProcess = await psList();
    const [amongUsProcess] = openedProcess.filter(proc => proc.name === 'Among Us.exe');
    return amongUsProcess ? amongUsProcess.pid : null;
});

ipcMain.handle('clear.among-us.folder', async e => {
    await restoreVanillaAmongUs();
});

ipcMain.handle('kill.among-us', async e => {
    const openedProcess = await psList();
    const amongUsProcess = openedProcess.filter(proc => proc.name === 'Among Us.exe');
    if(amongUsProcess.length > 0) {
        amongUsProcess.forEach(proc => process.kill(proc.pid));
    }

});

DownloadManager.register({
    downloadFolder: downloadModsFolder
});
console.log(dataPath);
console.log(os.userInfo().username);

app.on('ready', createWindow);
