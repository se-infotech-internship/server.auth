const fetch = require('node-fetch');


const Fetching = async (method: string, path: string, body?: any) => {
    return new Promise((resolve,reject) => {
        resolve(fetch(path, {
            method: method,
            body: body
        }))
    })
}

export default Fetching;

