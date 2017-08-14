const request = require('request');
const data = require('./data.json');

function makeRequest(url, method) {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: method
        }, (error, response, body) => {
            return error ? reject(error) : resolve(response, body);
        });
    });
}

function start() {
    return Promise.all(data.map(item => {
        const result = {
            request: {
                url: item.url,
                method: item.method,
            },
            response: {
                error: null
            }
        };

        return makeRequest(item.url, item.method)
            .then((response, body) => { 
                console.log(`recieved response for ${item.method}: ${item.url}`, JSON.stringify(response));

                result.response.statusCode = response.statusCode;         
            }, err => {
                console.warn(`unable to get response for ${item.method}: ${item.url}, error: ${err}`);
                
                result.response.error = err;
            })
            .then(() => {
                return result;
            });
    }));
}

module.exports = {
    start: start
};