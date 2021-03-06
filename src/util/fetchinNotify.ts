import Fetching from '../util/fetch';
const fetch = require('node-fetch');
const main = async (user: any, link: string) => {


    const serverUrl = process.env.NOTIF_URL || 'http://localhost:3000';

    const result: any = await Fetching('GET', link);
    const data = await result.json();

    if (data.fees.length > 0) {
        data.fees.forEach(async (fee: any) => {
            console.log(fee.date)
            let date = new Date(fee.date);
            const ms = 300000 // 5 min in miliseconds

            if (new Date().getTime() - date.getTime() < ms) {
                console.log('should to be send')
                await Fetching('POST', `${serverUrl}api/email/new-fee/toUser/`,
                    JSON.stringify({
                        email: user.email,
                        name: user.name,
                        link: 'google.com'
                    })
                )

                await Fetching('POST', `${serverUrl}api/push/new-fee/toUser/`, JSON.stringify({
                    registrationToken: 'user.registrationToken'
                }));
            }
            else {
                console.log("no need to send");
            }
        });
    }
};

export default main;
