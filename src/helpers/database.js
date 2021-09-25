const mongoose=require('mongoose')

const mongouri='mongodb+srv://admin:MongoAtlasDB@cluster0.lhtsk.gcp.mongodb.net/tripmates?retryWrites=true&w=majority'
//const mongouri=process.env.DB_URI


mongoose.connect(mongouri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(db=>console.log('conected to db'))
    .catch(error=>console.log(error))

module.exports=mongoose
