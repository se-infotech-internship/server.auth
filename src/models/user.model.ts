import Sequelize from 'sequelize';
import sequelize from '../storage/sql';

enum Distances {
  'm700' = '700',
  'm200' = '200',
  'm100' = '100',
}

interface UserAttributes {
  id: string;
  email: string;
  password?: string;
  confirmed?: boolean;
  name?: string;
  TZNumber?: string;
  TZLicence?: string;
  driverLicence?: string;
  rememberPassword: boolean;
  blocked?: boolean;
  isAdmin?: boolean;
  distToCam?: Distances;
  pushNotifications?: boolean;
  turnOnApp?: boolean;
  emailNotifications?: boolean;
  appPaymentReminder?: boolean;
  maxSpeedNotifications?: boolean;
  voiceNotifications?: boolean;
  sound?: boolean;
  finesAutoCheck?: boolean;
  finesPaymentAutoCheck?: boolean;
  distanceToCam?: boolean;
  camAutoFind?: boolean;
}

interface UserCreationAttributes
  extends Sequelize.Optional<UserAttributes, 'id'> {}

export interface UserInterface
  extends Sequelize.Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

const User = sequelize.define<UserInterface>('user', {
  //User info
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
  password: {
    type: Sequelize.STRING,
    defaultValue: '123456789',
  },
  name: Sequelize.STRING,
  TZNumber: Sequelize.STRING,
  TZLicence: Sequelize.STRING,
  driverLicence: Sequelize.STRING,
  // System settings
  confirmed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  rememberPassword: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  // Notification settings
  distToCam: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '700',
  },
  pushNotifications: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  turnOnApp: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  emailNotifications: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  appPaymentReminder: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  maxSpeedNotifications: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  // Voice notifications
  voiceNotifications: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  sound: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  // Fines
  finesAutoCheck: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  finesPaymentAutoCheck: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  // Camera
  distanceToCam: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  camAutoFind: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
});

export { User };
