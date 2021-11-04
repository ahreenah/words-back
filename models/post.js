'use strict';
import sequelize from 'sequelize';
const Model = sequelize.Model;
export default (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  };
  Post.init({
    text: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Post',
  });

  Post.associate = function(models) {
    Post.belongsTo(models.user);
    models.user.hasMany(Post);
    console.log('full assoc')
  };
  return Post;
};