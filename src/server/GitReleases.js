const gh = require('parse-github-url');
const fetch = require('electron-main-fetch');

class GitReleases {

    static fetchReleases = async (repo) => {
        const response = await fetch(`https://api.github.com/repos/${repo}/releases`);
        return await response.json();
    }

    static parseRepo = url => {
        return gh(url);
    }
}

module.exports = GitReleases;