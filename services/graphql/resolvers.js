
let posts=[];
import { parseResolveInfo, simplifyParsedResolveInfoFragmentWithType } from 'graphql-parse-resolve-info';

import { createSourceEventStream, execute } from 'graphql';
import knex from 'knex';
import db from '../../database/index.js';
// console.log(db.models.post.findAll());
const utils = {
    db,
};

import {v4 as uuid} from 'uuid';

// let uuid = require('uuid').v4;

  


// let wordSets = [{
//     name:"animals",
//     words:10,
//     language:'Swedish'
// },
// {
//     name:"fruit",
//     words:20,
//     language:'Finnish'
// }]

// let words=[
//     {
//         word:'Pineaple',
//         translation:'Ананас',
//         trainings:{
//             spelling:0,
//             chooseSpelling:1,
//             chooseTranslation:2
//         }
//     }
// ]

const resolvers = {
    RootQuery: {
        async stats(root, args, context){
            let knexDb = context.dataSources.knexDb;
            if(!context.user)
                return{
                    status:false,
                    message:'auth required'
                }
            let sets = await knexDb('user_training_dates').select({
                date:'date',
            }).where({
                user:context.user
            })
            console.log(context.user,sets);
            //stats
            let wordStats = await knexDb.schema.raw(`
select 
\tres type , 
\tcount(res) count
from (
\tselect  
\t\tiif(num=12, 'READY',iif(num is null,'PENDING','IN_PROGRESS')) res  
\tfrom (
\t\tselect 
\t\t\tword, 
\t\t\tsum(num)  num 
\t\tfrom (
\t\t\tselect 
\t\t\t\tword_sets.id setId, 
\t\t\t\twords.id word, 
\t\t\t\tword_trainings.count num 
\t\t\tfrom users 
\t\t\tjoin word_sets 
\t\t\t\ton word_sets.userId = users.id
\t\t\tjoin words 
\t\t\t\ton words.setId = word_sets.id
\t\t\tleft join word_trainings 
\t\t\t\ton word_trainings.wordId = words.id
\t\t\twhere users.id = ${context.user}
\t\t\torder by word
\t\t)

\t\tgroup by word
\t)
)
group by res;
`)


            return{
                trainingDates:sets.map(i=>i.date),
                inProgress:wordStats.filter(i=>i.type=='IN_PROGRESS')[0].count,
                learned:wordStats.filter(i=>i.type=='READY')[0].count,
                pending:wordStats.filter(i=>i.type=='PENDING')[0].count,
            }
        },
        async wordSets(root,args,context){
            console.log('USER$$',context.user)
            if(!context.user)
                return{
                    status:false,
                    message:'auth required'
                }
            let knexDb = context.dataSources.knexDb;
            let sets = await knexDb('word_sets').select({
                id:'id',
                name:'name',
                language:'language'
            }).where({
                userId:context.user
            })
            console.log(sets)
            return sets
            // console.log(context.user)
            // смотрит token в хедере
            
        },
        async wordSet(root,args,context){
            let knexDb = context.dataSources.knexDb;
            let set = await knexDb('word_sets').select({
                id:'id',
                name:'name',
                language:'language'
            }).where({
                id:args.id
            })
            console.log('got set',set)
            return {
                name:set[0].name,
                id:args.id,
                language:set[0].language
            }
        },
        word(root,args, context){
            return words[0]
        }
    },
    Word:{
        async trainings(root,args,context){
            // return {a:null}
            let knexDb = context.dataSources.knexDb;
            let data = await knexDb('words')
                .join('word_trainings','words.id','=','word_trainings.wordId')
                .where({id:root.id}).select({
                    trainingId:'trainingId',
                    count:'count'
                })
            console.log('gpt tr',data)
            let spelling = 0;
            if(data.filter(i=>i.trainingId==1).length)
                spelling = data.filter(i=>i.trainingId==1)[0].count
            console.log(spelling)

            let chooseSpelling=0;
            if(data.filter(i=>i.trainingId==2).length)
                chooseSpelling = data.filter(i=>i.trainingId==2)[0].count
            console.log(chooseSpelling)

            let chooseTranslation=0;
            if(data.filter(i=>i.trainingId==3).length)
                chooseTranslation = data.filter(i=>i.trainingId==3)[0].count
            
            let pairs=0;
            if(data.filter(i=>i.trainingId==4).length)
                pairs = data.filter(i=>i.trainingId==4)[0].count
            
            return {
                spelling,
                chooseSpelling,
                chooseTranslation,
                pairs
            }
            // TODO
        }
    },
    WordSet:{
        //words
        async wordsList(root,args,context,params){
            console.log(params)
            let requestedParams = parseResolveInfo(params);
            let word = requestedParams.fieldsByTypeName.Word;
            console.log('trainings',word.trainings);
            console.log('in subrequest')
            let knexDb = context.dataSources.knexDb;
            console.log('params',root)
            let words = await knexDb('words').select({
                id:'id',
                word:'word',
                translation:'translation'
            }).where({
                setId:root.id
            })
            return words
        }
    },
    RootMutation: {
        async createWordSet(root, { name, language }, context) {   
            console.log(context.user) 
            if(!context.user)
                return{
                    status:false,
                    message:'auth required'
                }
            const wordSetObject = {
                language,
                name,
                userId:context.user
            };
            // wordSets.push(wordSetObject);
            let knexDb = context.dataSources.knexDb;
            let res = await knexDb('word_sets').insert(
                wordSetObject
            );
            console.log(res)
            if(res.length){
                wordSetObject.id = res[0]
                return {status:true,wordSet:wordSetObject};
            }
            return{
                status:false
            }
        },
        async addWord(root,{word,translation,setId},context){
            // console.log(context.user) 
            if(!context.user)
                return{
                    status:false,
                    message:'auth required'
                }
            const wordObject = {
                word,
                translation,
                setId
            };
            // wordSets.push(wordSetObject);
            let knexDb = context.dataSources.knexDb;
            let res = await knexDb('words').insert(
                wordObject
            );
            return {
                ok:true
            }
        },
        async dropWord(root, {word,set}, context){
            if(!context.user)
            return{
                status:false,
                message:'auth required'
            }
            let knexDb = context.dataSources.knexDb;
            try{
                await knexDb('words')
                    .where({
                        id:word,
                        setId:set
                    })
                    .del()
                return {
                    ok:true, message:'deleted'
                }
            }
            catch(e){
                console.log(e)
                return{
                    ok:false,
                    message:'eror while deleting'
                }
            }
        },
        async dropWordSet(root, {set}, context){
            if(!context.user)
                return{
                    status:false,
                    message:'auth required'
                }
            let knexDb = context.dataSources.knexDb;
            try{
                await knexDb('word_sets')
                    .where({
                        id:set
                    })
                    .del()
                return {
                    ok:true, message:'deleted'
                }
            }
            catch(e){
                console.log(e)
                return{
                    ok:false,
                    message:'eror while deleting'
                }
            }
        },
        async register(root,{email,password,username},context){
            let knexDb = context.dataSources.knexDb;
            let user = await knexDb('users').select({
                id:'id'
            }).where({
                email
            })
            if(user.length)
                return{
                    ok:false, message:'email exists'
                }
            user = await knexDb('users').select({
                id:'id'
            }).where({
                username
            })
            if(user.length)
                return{
                    ok:false, message:'username exists'
                }
            
            let res = await knexDb('users').insert({
                name:'',
                password,
                pronoun:'',
                email,
                username,
                avatar:'',
            });
            user = await knexDb('users').select({
                id:'id'
            }).where({
                email
            })
            let id=user[0].id;
            let token = uuid();
            res = await knexDb('auth').insert({
                userId:id,
                token
            });
            return {ok:true, token}
        },
        async login(root,{login,password},context){
            let knexDb = context.dataSources.knexDb;
            console.log('login',login)
            let user = await knexDb('users').select({
                id:'id',
                password:'password'
            }).where({
                username:login
            }).orWhere({
                email:login
            })
            console.log(user)
            if(!user.length)
                return{
                    ok:false, message:'user not found'
                }
            if(password!=user[0].password)
                return{
                    ok:false,
                    message:'user not found'
                }
            console.log('user found')
            let id=user[0].id;
            let token = uuid();
            let res = await knexDb('auth').insert({
                userId:id,
                token
            });
            return {ok:true, token}
        },
        async saveTrainingResult(root,{training,word,result},context){
            let knexDb = context.dataSources.knexDb;
                console.log('before insett')
                if(result){
                    console.log('data',(await knexDb('word_trainings').where({
                        trainingId:training,
                        wordId:word  
                    })).length)
                    if((await knexDb('word_trainings').where({
                        trainingId:training,
                        wordId:word  
                    })).length==0){
                        await knexDb('word_trainings').insert({
                            trainingId:training,
                            count:1,
                            wordId:word
                        })
                        console.log('really inserted')
                    }
                    else
                        await knexDb.schema.raw(`
                            update word_trainings 
                                set count=count+1
                                where (trainingId=${training} and wordId=${word});
                            `)
                }
                else{
                    await knexDb('word_trainings')
                        .where({
                            trainingId:training,
                            wordId:word
                        })
                        .del()
                }

            console.log('date saved')
            return{
                ok:true,
                message:''
            }
        },
        async saveTrainingResults(root,{list},context){
            let knexDb = context.dataSources.knexDb;
            console.log('before insett')
            for(let i of list){
                let  {training, word, result } = i;
                if(result){
                    console.log('data',(await knexDb('word_trainings').where({
                        trainingId:training,
                        wordId:word  
                    })).length)
                    {/*
                    if((await knexDb('word_trainings').where({
                        trainingId:training,
                        wordId:word  
                    })).length==0){
                        await knexDb('word_trainings').insert({
                            trainingId:training,
                            count:1,
                            wordId:word
                        })
                        console.log('really inserted')
                    }
                    else{
                    await knexDb.schema.raw(`
                        update word_trainings 
                            set count=count+1
                            where (trainingId=${training} and wordId=${word});
                        `)
                    console.log('WeWeWe')
                    */}
                        await knexDb.schema.raw(`
                            insert into word_trainings values(${word},${training},1) on CONFLICT (wordId, trainingId) do update set count = count+1 ;
                        `)
                    // }
                }
                else{
                    await knexDb('word_trainings')
                        .where({
                            trainingId:training,
                            wordId:word
                        })
                        .del()
                }
                console.log('inserted')
            }
            
            await knexDb.schema.raw(`
                            insert into user_training_dates(date, user) values(Date(),${context.user});
                        `)
            // console.log(await knexDb('user_training_dates').insert({
            //     user:context.user,
            //     date:new Date().toISOString()
            // }))
            
            console.log('date saved')
        }
    },
};



// const oldResolvers = {
//     Message: {
//         async user(message, args, context) {
//             console.log('mes',message)
//             console.log('user',await db.models.user.findOne({where:{id:message.userId}}))
//             return await db.models.user.findOne({where:{id:message.userId}});

//             // return message.getUser();
//         },
//         chat(message, args, context) {
//             return message.getChat();
//         },
//     },
//     Chat: {
//         messages(chat, args, context) {
//             return chat.getMessages({order: [['id', 'ASC']]});
//         },
//         users(chat, args, context) {
//             return chat.getUsers();
//         },
//     },
//     RootQuery: {
//         async posts(root, args, context) {
//             console.log(args)
//             // все работает, надо avatar
//             let res = await db.models.post.findAll({
//                 include: [
//                     {
//                         model: db.models.user,
//                     },
//                 ],
//             });
//             return await res
//         },
//         wordSets(root,args,context){
//             return [{
//                 name:"animals",
//                 words:10
//             }]
//         },
//         chats(root, args, context) {
//             return db.models.user.findAll().then(async (users) => {
//                 if (!users.length) {
//                     return [];
//                 }
//                 const usersRow = users[0];
//                 // console.log('chat --',await db.models.chat.findAll())
//                 return await db.models.chat.findAll({
//                     include: [{
//                         model: db.models.user,
//                     },
//                         {
//                             model: db.models.message,
//                         }],
//                 });
//             });
//         },
//         chat(root, { chatId }, context) {
//             return db.models.chat.findAll({
//                 query:{
//                     id:chatId
//                 },
//                 include: [{
//                     model: db.models.user,
//                     required: true,
//                 },
//                     {
//                         model: db.models.message,
//                     }],
//             });
//         },

//     },
//     Post: {
//         async user(post, args, context) {
//             return post.User;
//         },
//     },
//     RootMutation: {
//         async addPost(root, { post, user }, context) {
//             const postObject = {
//                 ...post,
//                 user,
//             };
//             await db.models.post.create({
//                 text:post.text,
//                 userId:user.id
//             });
//             return postObject;
//         },
//     },
// };
/*
fetch('http://localhost:8000/graphql', {
   method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: `{"query":"{ posts {id} }"}`
})
*/
export default resolvers;
    