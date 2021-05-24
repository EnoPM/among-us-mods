const Storage = require('./Storage');
const ModInstaller = require('./ModInstaller');
const {ipcMain, shell} = require('electron');
const fs = require('fs');
const GitReleases = require("./GitReleases");
const {exec, spawn} = require('child_process');
const lnk = require('lnk');
const psList = require('ps-list');
const process = require('process');
const path = require('path');
const fetch = require('electron-main-fetch');

const VANILLA_FILES_URL = 'https://raw.githubusercontent.com/clicpanel/among-us-mods/master/default/vanilla_files.json';

class AmongUsMods {

    static VANILLA_FILES = null;

    static LOCAL_DATA_EXCLUDES_FILES = [
        'playerStats2'
    ];

    static getVanillaFiles = async () => {
        if(AmongUsMods.VANILLA_FILES === null) {
            const response = await fetch(VANILLA_FILES_URL);
            AmongUsMods.VANILLA_FILES = await response.json();
        }
        return AmongUsMods.VANILLA_FILES;
    }

    /**
     * @param {string} dataPath
     */
    constructor(dataPath) {
        this.storage = new Storage();
        this.paths = {
            dataPath,
            downloadModsFolder: dataPath + '/mods-archives',
            modsFolder: dataPath + '/mods'
        }
        this.installer = new ModInstaller(this.paths);
    }

    start = () => {
        ipcMain.on('storage.set', this._onStorageSet);
        ipcMain.on('storage.get', this._onStorageGet);

        ipcMain.handle('get.mods', this._onModsGet);
        ipcMain.handle('update.config', this._onUpdateConfig);
        ipcMain.handle('check.config', this._onCheckConfig);
        ipcMain.handle('download.mod', this._onDownloadMod);
        ipcMain.handle('uninstall.mod', this._onUninstallMod);
        ipcMain.handle('update.mod', this._onUpdateMod);
        ipcMain.handle('get.installed.mods', this._onGetInstalledMods);
        ipcMain.handle('play.mod', this._onPlayMod);
        ipcMain.handle('play.vanilla', this._onPlayVanilla);
        ipcMain.handle('open.link', this._onOpenLink);
        ipcMain.handle('check.among-us.running', this._onCheckAmongUsIsRunning);
        ipcMain.handle('clear.among-us.folder', this._onClearAmongUsFolder);
        ipcMain.handle('kill.among-us', this._onKillAmongUsProcess);
        ipcMain.handle('get.config', this._onGetConfig);
        ipcMain.handle('open.folder', this._onOpenModFolder);
        ipcMain.handle('clear.local.appdata', this._onClearLocalAppdata);
        ipcMain.handle('get.regions', this._onGetRegions);
        ipcMain.handle('set.regions', this._onSetRegions);
    }

    // Event listeners

    _onGetRegions = async e => {
        const filePath = path.resolve(process.env.APPDATA, '..\\LocalLow\\Innersloth\\Among Us\\regionInfo.json');
        if(fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath);
            return JSON.parse(content.toString());
        }

        return null;
    }

    _onSetRegions = async (e, {content}) => {
        const filePath = path.resolve(process.env.APPDATA, '..\\LocalLow\\Innersloth\\Among Us\\regionInfo.json');
        await fs.promises.writeFile(filePath, JSON.stringify(content));
    }

    _onClearLocalAppdata = async e => {
        const folderPath = path.resolve(process.env.APPDATA, '..\\LocalLow\\Innersloth\\Among Us');
        const folder = await fs.promises.readdir(folderPath);
        const toRemove = [];
        for (const file of folder) {
            if(!AmongUsMods.LOCAL_DATA_EXCLUDES_FILES.includes(file)) {
                const filePath = `${folderPath}\\${file}`;
                if(fs.lstatSync(filePath).isDirectory()) {
                    toRemove.push(fs.promises.rmdir(filePath, {
                        recursive: true
                    }));
                } else {
                    toRemove.push(fs.promises.unlink(filePath));
                }
            }
        }
        await Promise.all(toRemove);
    }

    _onOpenModFolder = async (e, {url}) => {
        const github = GitReleases.parseRepo(url);
        const folder = `${this.paths.modsFolder}/${github.repo}`.replace(/\//g, '\\');
        console.log(folder);
        await shell.openPath(folder);
    }

    _onGetConfig = async e => {
        return await this.storage.getConfig();
    }

    _onKillAmongUsProcess = async e => {
        const openedProcess = await psList();
        const amongUsProcess = openedProcess.filter(proc => proc.name === 'Among Us.exe');
        if(amongUsProcess.length > 0) {
            amongUsProcess.forEach(proc => process.kill(proc.pid));
        }
    }

    _onClearAmongUsFolder = async e => {
        await this.restoreVanilla();
    }

    _onCheckAmongUsIsRunning = async e => {
        const openedProcess = await psList();
        const [amongUsProcess] = openedProcess.filter(proc => proc.name === 'Among Us.exe');
        return amongUsProcess ? amongUsProcess.pid : null;
    }

    _onOpenLink = async (e, {link}) => {
        await shell.openExternal(link);
        return true;
    }

    _onPlayVanilla = async e => {
        await this.restoreVanilla();
        const executable = await this.getAmongUsExecutable();
        spawn(executable, {
            detached: true
        });
        return true;
    }

    _onPlayMod = async (e, {url}) => {
        const github = GitReleases.parseRepo(url);
        await this.restoreVanilla();
        const folder = `${this.paths.modsFolder}/${github.repo}`;
        const files = await fs.promises.readdir(folder);
        const amongUsFolder = await this.getAmongUsInstallationFolderPath();
        for (const fileName of files) {
            const filePath = `${folder}/${fileName}`;
            if((await fs.promises.lstat(filePath)).isFile()) {
                await lnk(`${folder}/${fileName}`, amongUsFolder);
            } else {
                await lnk(`${folder}/${fileName}`, amongUsFolder);
            }
        }
        spawn(amongUsFolder + 'Among Us.exe', {
            detached: true
        });
        return true;
    }

    _onGetInstalledMods = async e => {
        if(!fs.existsSync(this.paths.modsFolder)) {
            return [];
        } else {
            const folders = await fs.promises.readdir(this.paths.modsFolder);
            return folders.map(folder => Number.parseInt(folder));
        }
    }

    _onUpdateMod = async (e, {url, versionTag}) => {
        const github = GitReleases.parseRepo(url);
        const gits = await GitReleases.fetchReleases(github.repo);
        const [git] = versionTag ? gits.filter(git => git.tag_name === versionTag) : gits;
        console.log(git);
        const {assets} = git;
        const [dllAsset] = versionTag ? [] : assets.filter(a => a.hasOwnProperty('browser_download_url') && a.browser_download_url.endsWith('.dll'));
        const [asset] = dllAsset ? [dllAsset] : assets.filter(a => a.hasOwnProperty('browser_download_url') && a.browser_download_url.endsWith('.zip'));
        if(asset && asset.hasOwnProperty('browser_download_url') && git.hasOwnProperty('tag_name')) {
            const info = await this.installer.download(asset.browser_download_url, this._triggerDownloadProgressCallback(e));
            if(info) {
                if(dllAsset) {
                    await this.installer.installDll(info.filePath, github.repo);
                } else {
                    await this.installer.install(info.filePath, github.repo);
                }

                const result = {
                    repo: url,
                    version: git.tag_name
                }
                const mods = await this.storage.getMods();
                for (const k in mods) {
                    if(mods[k].repo === result.repo) {
                        mods[k].version = result.version;
                    }
                }
                await this.storage.setMods(mods);
                return result;
            }
        }
    }

    _onUninstallMod = async (e, {url}) => {
        const github = GitReleases.parseRepo(url);
        await fs.promises.rmdir(`${this.paths.modsFolder}/${github.repo}`, {
            recursive: true
        });
        const mods = await this.storage.getMods();
        for (const k in mods) {
            if(mods[k].repo === url) {
                mods.splice(k, 1);
                break;
            }
        }
        await this.storage.setMods(mods);
        return url;
    }

    _onDownloadMod = async (e, {url}) => {
        const github = GitReleases.parseRepo(url);
        const [git] = await GitReleases.fetchReleases(github.repo);
        const {assets} = git;
        const [asset] = assets.filter(a => a.hasOwnProperty('browser_download_url') && a.browser_download_url.endsWith('.zip'));
        if(asset && asset.hasOwnProperty('browser_download_url') && git.hasOwnProperty('tag_name')) {
            const info = await this.installer.download(asset.browser_download_url, this._triggerDownloadProgressCallback(e));
            if(info) {
                await this.installer.install(info.filePath, github.repo);
                const result = {
                    repo: url,
                    version: git.tag_name
                }
                const mods = await this.storage.getMods();
                mods.push(result);
                await this.storage.setMods(mods);
                return result;
            }
        }
    }

    _onCheckConfig = async e => {
        const config = await this.storage.get('config');
        return typeof config === 'object' && config.hasOwnProperty('amongUsFolder') && fs.existsSync(config.amongUsFolder);
    }

    _onUpdateConfig = async (e, {amongUsFilePath}) => {
        const vanillaFiles = await AmongUsMods.getVanillaFiles();
        if (fs.existsSync(amongUsFilePath) && amongUsFilePath.endsWith('Among Us.exe')) {
            const folderPath = amongUsFilePath.replace('Among Us.exe', '');
            if (vanillaFiles.map(fileName => fs.existsSync(folderPath + fileName))) {
                await this.storage.setConfig({amongUsFolder: amongUsFilePath});
                return true;
            }
        } else {
            return false;
        }
    }

    _onStorageSet = (e, {key, value}) => {
        this.storage.set(key, value).then(() => {
            e.returnValue = 'received';
        });
    }

    _onStorageGet = (e, {key}) => {
        this.storage.get(key).then(data => {
            if (Array.isArray(data) && data.length === 0 || Object.keys(data).length === 0) {
                e.returnValue = null;
            } else {
                e.returnValue = data;
            }
        });
    }

    _onModsGet = async e => {
        const mods = await this.storage.get('mods');
        return Array.isArray(mods) ? mods : [];
    }

    // Callback generators

    _triggerDownloadProgressCallback = e => {
        return progress => {
            e.sender.send('download.mod.progress', progress);
        }
    }

    // Utils methods

    exec = command => {
        return new Promise(resolve => {
            exec(command, (error, data, getter) => {
                if(error){
                    console.log("error",error.message);
                    return;
                }
                if(getter){
                    console.log("data", data);
                    return;
                }
                console.log("data", data);
                resolve(true);
            });
        });
    }

    getAmongUsExecutable = async () => {
        const data = await this.storage.getConfig();
        if (data.hasOwnProperty('amongUsFolder')) {
            return data.amongUsFolder;
        }
    }

    getAmongUsInstallationFolderPath = async () => {
        const amongUsFolder = await this.getAmongUsExecutable();
        return amongUsFolder.replace('Among Us.exe', '');
    }

    restoreVanilla = async () => {
        const vanillaFiles = await AmongUsMods.getVanillaFiles();
        const amongUsFolder = await this.getAmongUsInstallationFolderPath();
        const files = await fs.promises.readdir(amongUsFolder);
        for (const file of files) {
            if(!vanillaFiles.includes(file)) {
                const filePath = amongUsFolder + file;
                if((await fs.promises.lstat(filePath)).isDirectory()) {
                    await this.exec(`rmdir "${filePath}"`);
                } else {
                    await fs.promises.unlink(filePath);
                }
            }
        }
        return true;
    }
}

module.exports = AmongUsMods;