import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const passwordDb = process.env.DB_PASSWORD as string;
const sequelize = new Sequelize('autoradar', 'autoradar', passwordDb, {
  dialect: 'mariadb',
  host: 'localhost',
  port: 3306,
});

export = sequelize;
