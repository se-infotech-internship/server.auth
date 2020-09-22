import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../util/db';

const User = sequelize.define('user', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: uuidv4()
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    blocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    name: Sequelize.STRING,
    secondName: Sequelize.STRING,
    middleName: Sequelize.STRING,
    ipn: Sequelize.STRING
});

module.exports = User;