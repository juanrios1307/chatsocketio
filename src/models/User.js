// Cargamos el módulo de mongoose
const mongoose =  require('mongoose');
var Schema=mongoose.Schema;

const User = mongoose.model('users',{
    email: {type:String, required:true, unique:true},
    password : {type:String, required:true},
    name: {type:String, required:true},
    phone:  {type:String, required:true},
    city: {type:String, required:true},
    avatar : {type:String, required:true},
    Rating : [{
        user: {type: Schema.Types.ObjectId, ref: 'users'},
        comment: {type: String, required: true},
        rating: {type: Number, required: true},
        date: {type: Date, default: Date.now()},
        aproved: {type: Boolean}
    }],
    Likes :[{type: Schema.Types.ObjectId, ref: 'trips'}],
    Dislikes :[{type: Schema.Types.ObjectId, ref: 'trips'}]
})

module.exports = User
