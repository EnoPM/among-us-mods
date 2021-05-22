const storage = require('electron-json-storage');

class Storage {

    /**
     * @return {Promise<Array>}
     */
    getMods = async () => {
        const mods = await this.get('mods');
        if(Array.isArray(mods)) {
            return mods;
        } else {
            return [];
        }
    }

    setMods = async mods => {
        return await this.set('mods', mods);
    }

    getConfig = async () => {
        return await this.get('config');
    }

    setConfig = async config => {
        return await this.set('config', config);
    }

    /**
     * @param {string} key
     * @return {Promise<Array|Object>}
     */
    get = (key) => {
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

    /**
     * @param {string} key
     * @param {Array|Object} value
     * @return {Promise<boolean>}
     */
    set = (key, value) => {
        return new Promise(resolve => {
            storage.set(key, value, function (error) {
                if (error) {
                    throw error;
                }
                resolve(true);
            });
        });
    }
}

module.exports = Storage;