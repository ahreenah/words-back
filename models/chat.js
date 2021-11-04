'use strict';
import sequelize from 'sequelize';
const Model = sequelize.Model;

export default (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      console.log(models);
      Chat.hasMany(models.message);
      models.message.belongsTo(Chat);
      models.user.belongsToMany(Chat, { through: 'users_chats' });
      Chat.belongsToMany(models.user, { through: 'users_chats' });
    }
  };
  Chat.init({
    bame: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Chat',
  });

  // Chat.associate = function(models) {
  // }
  return Chat;
};