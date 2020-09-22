import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize('users', 'root', process.env.DB_PASSWORD, { 
    dialect: 'mariadb',
    host: 'localhost'
});

export = sequelize;