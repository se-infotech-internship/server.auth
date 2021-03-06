const fetch = require('node-fetch');


const Fetching = async (method: string, path: string, body?: any) => {
    return new Promise((resolve, reject) => {
        resolve(fetch(path, {
            method: method,
            body: body,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        }
        ))
    })
}

export default Fetching;

