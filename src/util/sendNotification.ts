import { Op } from 'sequelize';
import { User } from '../models/user.model';
import fetchNotify from './fetchinNotify';

const serverUrl = process.env.INTERGATION_URL || 'http://localhost:4000';

const main = async () => {
    let users = await User.findAll(
        {
            where: {
                TZNumber: { [Op.not]: null }
            }


        });

    console.log(JSON.stringify(users));

    users.forEach(async (user) => {
        if (user.TZNumber != null) {
            console.log('success1')
            await fetchNotify(user, `${serverUrl}/fees/get-fee/by/tzNumber/${user.TZNumber}`)
        }
        if (user.TZNumber == null && user.TZLicence != null) {
            await fetchNotify(user, `${serverUrl}/fees/get-fee/by/tzCertificate/${user.TZLicence}`)
        }
        if (user.TZLicence == null && user.TZNumber == null) {
            await fetchNotify(user, `${serverUrl}/fees/get-fee/by/driverLicence/${user.driverLicence}`)
        }
    });
}

export default main;