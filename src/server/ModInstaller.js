const fs = require('fs');
const DownloadManager = require("electron-download-manager");
const unzipper = require("unzipper");

class ModInstaller {

    /**
     * @param {{dataPath:string, downloadModsFolder:string, modsFolder:string}} paths
     */
    constructor(paths) {
        this.paths = paths;
        DownloadManager.register({
            downloadFolder: this.paths.downloadModsFolder
        });
    }

    download = (url, onProgress) => {
        return new Promise(resolve => {
            DownloadManager.download({
                url,
                onProgress
            }, (error, info) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(info);
                }
            });
        });
    }

    install = async (filePath, repo) => {
        const rs = fs.createReadStream(filePath);
        await rs.pipe(unzipper.Extract({
                path: `${this.paths.modsFolder}/${repo}`
            }))
            .on('entry', entry => entry.autodrain())
            .promise();
        rs.close();
        await fs.promises.unlink(filePath);
    }

    installDll = async (filePath, repo) => {
        const temp = filePath.split('\\');
        await fs.promises.copyFile(`${filePath}`, `${this.paths.modsFolder}/${repo}/BepInEx/plugins/${temp[temp.length - 1]}`);
        await fs.promises.unlink(filePath);
    }
}

module.exports = ModInstaller;