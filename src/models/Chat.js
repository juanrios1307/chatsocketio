// Cargamos el módulo de mongoose
const mongoose =  require('mongoose');
var Schema=mongoose.Schema;
// Usaremos los esquemas

// Creamos el objeto del esquema y sus atributos
const Chat = mongoose.model('chats',{
    user1: { type: Schema.ObjectId, ref: 'users' },
    user2: { type: Schema.ObjectId, ref: 'users' },
    Messages:[{
        text: {type: String, required: true},
        createdAt: {type: Date, default: Date.now},
        user: {type: Schema.ObjectId, ref: 'users'},
        read:{type:Boolean, default:false}
    }]

})

// Exportamos el modelo para usarlo en otros ficheros
module.exports = Chat
