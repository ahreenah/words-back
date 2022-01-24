const oldTypeDefinitions = `
type User {
    avatar: String
    username: String
    id: Int
}
    
type Post {
    id: Int
    user: User
    text: String
}

type Message {
    id: Int
    text: String
    chat: Chat
    user: User
}
type Chat {
    id: Int
    messages: [Message]
    users: [User]
}

type WordSet{
    name:String,
    words:Int
}

type RootQuery {
    posts: [Post]
    chats: [Chat]
    chat(chatId: Int): Chat
    wordSets : [WordSet]
}

input PostInput {
    text: String!
}

input UserInput {
    username: String!
    avatar: String!
}

input UserForPost {
    id: Int!
}

type RootMutation {
    addPost (
        post: PostInput!
        user: UserForPost!
    ): Post
    register(
        
    ),
    
}



schema {
    query: RootQuery
    mutation: RootMutation
}
`;


const typeDefinitions= `
type User {
    avatar: String
    username: String
    pronoun: String
    email:String
    name:String
    id: Int
}

type TrainingData{
    spelling: Int
    chooseSpelling: Int
    chooseTranslation: Int
    pairs:Int
}

type Word{
    word:String
    id:Int
    translation: String
    trainings: TrainingData
}

type WordSet{
    name:String,
    language:String,
    words:Int
    wordsList:[Word]
    id:Int
}

type UserStats {
    trainingDates:[String]
    inProgress:Int
    pending:Int
    learned:Int
}

type RootQuery {
    wordSets : [WordSet]
    word(setId:Int, id:Int):Word
    wordSet(id:Int): WordSet
    stats : UserStats
}

type AuthStatus{
    ok: Boolean
    token:String
    message:String
}

type WordSetResponse{
    status:String
    message:String
    wordSet:WordSet
}

type WordResponse{
    ok:Boolean
    message:String
}



type SaveTrainingResponse{
    ok:Boolean
    message:String
}

input TrainWordResult{
    word:Int,
    training:Int,
    result:Boolean
}

type RootMutation{
    createWordSet(name:String, language:String):WordSetResponse
    register(email:String, password:String, username:String, name:String, pronoun:Int):AuthStatus
    login(login:String, password:String):AuthStatus
    addWord(word:String, translation:String,setId:Int):WordResponse
    dropWord(word:Int, set:Int):WordResponse
    dropWordSet(set:Int):WordResponse
    saveTrainingResult(training:Int,word:Int,result:Boolean):SaveTrainingResponse
    saveTrainingResults(training:Int,list:[TrainWordResult]):SaveTrainingResponse,
}


schema {
    query: RootQuery
    mutation:RootMutation
}
`
export default [typeDefinitions];