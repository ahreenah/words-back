'use strict';
import sequelize from 'sequelize';
const Model = sequelize.Model;
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.associate = function(models) {
        User.hasMany(models.Post);
      };
      // define association here
    }
  };
  User.init({
    username: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
  });

  User.associate = function(models) {
    console.log('associated!')
    console.log(models)
    User.belongsToMany(models.chat, { through: 'users_chats' });
    models.chat.belongsToMany(User, { through: 'users_chats' });



    User.hasMany(models.message)
    models.message.belongsTo(User)
    // Post.belongsTo(models.User);
  };
  return User;
};