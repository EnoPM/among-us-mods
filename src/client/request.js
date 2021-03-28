import 'regenerator-runtime/runtime';

export class Request {
    constructor(endpoint, system) {
        this.endpoint = endpoint;
        this._accessToken = null;
        this.system = system;
    }

    set accessToken(value) {
        this._accessToken = value;
    }

    /**
     * @param {string} method
     * @param {Array<string>} endpoints
     * @param {object} data
     * @returns {Promise<object>}
     */
    async make(method = 'get', endpoints = [], data = {}) {
        let uri = endpoints.join('/');
        let error = null;
        if(method === 'get') {
            let query = [];
            for (const key in data) {
                let value = data[key];
                query.push(`${key}=${value}`);
            }
            if(query.length >= 1) {
                uri += `?${query.join('&')}`;
            }
        }
        let url = this._accessToken === null ? `${this.endpoint}/${uri}` : `${this.endpoint}/${this._accessToken}/${uri}`;
        let result = await this.system.request(url, {
            method,
            body: method === 'get' ? null : JSON.stringify(data)
        }).catch(e => {
            error = e;
        });
        if(error) {
            return error;
        }
        return result;
    }
}