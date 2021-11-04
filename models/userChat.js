'use strict';
import
    sequelize
from 'sequelize';
const Model = sequelize.Model;
module.exports = (sequelize, DataTypes) => {
    class UserChat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Chat.init({
        userId: DataTypes.INTEGER,
        chatId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Chat',
    });
    return UserChat;
};