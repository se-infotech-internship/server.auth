import Sequelize from 'sequelize';
import sequelize from '../storage/sql';

interface TokenAttributes {
  id: string;
}

interface TokenCreationAttributes
  extends Sequelize.Optional<TokenAttributes, 'id'> {}

export interface TokenInterface
  extends Sequelize.Model<TokenAttributes, TokenCreationAttributes>,
  TokenAttributes {}

const Token = sequelize.define<TokenInterface>('user', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  }
});

export { Token };
