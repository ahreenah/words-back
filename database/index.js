import Sequelize from 'sequelize';

const sequelize = new Sequelize({dialect:'sqlite',storage:'C:\\Users\\medvosa\\Documents\\ReactGraphql\\back\\database\\db.sqlite'});
 // (async () =>{console.log(await sequelize.query('select * from sqlie'))})()

import models from '../models/index.mjs';

const db = {
    sequelize,
    models: models(sequelize),
}

export default db;
