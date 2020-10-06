import Sequelize from 'sequelize';
import sequelize from '../storage/sql';

interface MessageAttributes {
  id: string;
  body: string;
  to: string;
  from: string;
}

interface MessageCreationAttributes
  extends Sequelize.Optional<MessageAttributes, 'id'> {}

export interface MessageInterface
  extends Sequelize.Model<MessageAttributes, MessageCreationAttributes>,
  MessageAttributes {}

const Message = sequelize.define<MessageInterface>('message', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  body: Sequelize.STRING,
  to: Sequelize.STRING,
  from: Sequelize.STRING
});

export { Message };
