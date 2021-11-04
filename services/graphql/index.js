import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import Resolvers from './resolvers.js';
import Schema from './schema.js';
import knex from 'knex';

const knexDb = knex({
  client: 'sqlite3',
  debug:true,
  connection: {
    filename: 'C:/Users/medvosa/Documents/WordsBack/db.db',
  }
});

let clear = false;


async function dataBaseTest(){
  console.log('BEFORE CREATING TABLE')
  
  if(clear)
    await knexDb.schema.dropTable('users');
  if(! (await knexDb.schema.hasTable('users')) )
    console.log(await knexDb.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('password').notNullable();
      table.integer('pronoun');
      table.string('email').notNullable().unique();
      table.string('username').notNullable().unique();
      table.string('avatar');
    }))
  // const userObject = {
  //     email:'aaa',
  //     password:'bbb',
  //     username:'ccc',
  //     name:'',
  //     pronoun:'',
  //     avatar:''
  // }
  // let res = await knexDb('users').insert(userObject);
  if(clear)
    await knexDb.schema.dropTable('auth');
  if(! (await knexDb.schema.hasTable('auth')) )
    await knexDb.schema.createTable('auth',function(table){
      table.string('token');
      table.integer('userId');
      table.foreign('userId').references('users.id')
    })
  if(clear)
    await knexDb.schema.dropTable('word_sets');
  if(! (await knexDb.schema.hasTable('word_sets')) )
    await knexDb.schema.createTable('word_sets',function(table){
      table.increments('id').primary();
      table.string('language').notNullable();
      table.string('name').notNullable();
      table.integer('userId').notNullable();
      table.foreign('userId').references('users.id');
    });
  if(clear)
    await knexDb.schema.dropTable('words');
  if(! (await knexDb.schema.hasTable('words')) )
  await knexDb.schema.createTable('words',function(table){
    table.increments('id').primary;
    table.string('word').notNullable();
    table.string('translation').notNullable();
    table.integer('setId');
    table.foreign('setId').references('word_sets.id').onDelete('cascade');
  })
  if(clear)
    await knexDb.schema.dropTable('word_trainings');
  if(! (await knexDb.schema.hasTable('word_trainings')) )
    await knexDb.schema.createTable('word_trainings',function(table){
      table.integer('wordId').notNullable();
      table.integer('trainingId').notNullable();
      table.integer('count').notNullable();
      table.foreign('wordId').references('words.id').onDelete('cascade');
    });
  if(! (await knexDb.schema.hasTable('user_training_dates')) )
    await knexDb.schema.createTable('user_training_dates',function(table){
      table.increments('id').primary;
      table.date('date').notNullable();
      table.integer('user');
      table.foreign('user').references('users.id').onDelete('cascade');
    })
  let res = await knexDb('auth').insert({token:'aaa',userId:12});
  // await knexDb.schema.

  console.log('BEFORE INSERT')
  // console.log(await knexDb('users').insert({name:'petya'}))
  console.log("INSERTED")
  console.log('SELECT',await knexDb.select('name').from('users'))
}
dataBaseTest();
const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
});
// const server={};

let tokens={
  s28g72gf932gf239f2:{
    login:'medvosa'
  },
  asgfksfg80gb024gsa:{
    login:'user2'
  }
}

const server = new ApolloServer({
    schema: executableSchema,
    context: async function({ req }) {
      req;
      // let user=null;
      console.log(req.headers.token)
      if(req.headers.token){
        let user=await knexDb('auth').select({
          id:'userId'
        }).where({
          token:req.headers.token
        })
        console.log(user)
        if(user.length)
          return {user:user[0].id}
      }
      return null
    },
    dataSources:()=>{
      return{
        knexDb
      }
    }
});
await server.start();
export default server;