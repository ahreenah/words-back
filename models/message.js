'use strict';
import sequelize from 'sequelize';
const Model = sequelize.Model;

export default (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Message.init({
    text: DataTypes.TEXT,
    userId:DataTypes.INTEGER,
    chatId:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Message',
  });
  Message.associate = function(models) {
    Message.belongsTo(models.user);
    Message.belongsTo(models.chat);
    models.user.hasMany(Message);
    models.chat.hasMany(Message)
  };
  return Message;
};