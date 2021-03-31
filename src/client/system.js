import {ipcRenderer} from 'electron';
export class SystemController {

    static async getStorage(name) {
        return await this._trigger('storage.get', {
            key: name
        });
    }

    static async setStorage(name, value) {
        return await this._trigger('storage.set', {
            key: name,
            value
        });
    }

    static async downloadFile(mod) {
        return this._triggerAsync('download.zip', {
            mod
        });
    }

    static async downloadMod(repo) {
        return this._triggerAsync('download.mod', {
            url: repo
        });
    }

    static async updateMod(repo) {
        return this._triggerAsync('update.mod', {
            url: repo
        });
    }

    static async uninstallMod(repo) {
        return this._triggerAsync('uninstall.mod', {
            url: repo
        });
    }

    static async getMods() {
        return this._triggerAsync('get.mods');
    }

    static async getInstalledMods() {
        return await this._triggerAsync('get.installed.mods');
    }

    static async playMod(repo) {
        return await this._triggerAsync('play.mod', {url: repo});
    }

    static async playVanilla() {
        return await this._triggerAsync('play.vanilla');
    }

    static async openLink(link) {
        return await this._triggerAsync('open.link', {link});
    }

    static async closeApp() {
        return await this._triggerAsync('close.app');
    }

    static async minimizeApp() {
        return await this._triggerAsync('minimize.app');
    }

    static async checkConfig() {
        return await this._triggerAsync('check.config');
    }

    static async updateConfig(amongUsFilePath) {
        return await this._triggerAsync('update.config', {amongUsFilePath});
    }

    static async checkAmongUsProcess() {
        return await this._triggerAsync('check.among-us.running');
    }

    static async clearAmongUsFolder() {
        return await this._triggerAsync('clear.among-us.folder');
    }

    static async killAmongUsProcess() {
        return await this._triggerAsync('kill.among-us');
    }

    static on(name, cb) {
        ipcRenderer.addListener(name, cb);
    }

    static off(name, cb) {
        ipcRenderer.removeListener(name, cb);
    }

    static async _trigger(name, data) {
        return ipcRenderer.sendSync(name, data);
    }

    static async _triggerAsync(name, data) {
        return await ipcRenderer.invoke(name, data);
    }
}