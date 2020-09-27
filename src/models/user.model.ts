import Sequelize from 'sequelize';
import sequelize from '../util/db';

interface UserAttributes {
  id: string;
  email: string;
  confirmed?: boolean;
  password: string;
  blocked?: boolean;
  isAdmin: boolean;
  isloggedIn?: boolean;
  name?: string;
  TZNumber?: string;
  TZLicence?: string;
  driverLicence?: string;
}

interface UserCreationAttributes
  extends Sequelize.Optional<UserAttributes, 'id'> {}

export interface UserInterface
  extends Sequelize.Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

const User = sequelize.define<UserInterface>('user', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  confirmed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  blocked: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isloggedIn: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  name: Sequelize.STRING,
  TZNumber: Sequelize.STRING,
  TZLicence: Sequelize.STRING,
  driverLicence: Sequelize.STRING,
});

export { User };
