import Sequelize from 'sequelize';
import post from './post.js'
import user from './user.js'
import chat from './chat.js'
import message from './message.js'
if (process.env.NODE_ENV === 'development') {
    require('babel-plugin-require-context-hook/register')()
}
// export default {}
export default (sequelize) => {
    let db = {};

    const model2 = chat(sequelize, Sequelize);
    db['chat'] = model2;

    const model3 = message(sequelize, Sequelize);
    db['message'] = model3;

    const model1 = user(sequelize, Sequelize);
    db['user'] = model1;

    const model = post(sequelize, Sequelize);
    db['post'] = model;

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    return db;
};