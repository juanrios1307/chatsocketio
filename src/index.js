const express=require('express')
const http = require('http')
const socketio = require('socket.io')

require('./helpers/database')


const app=express()
const server = http.Server(app)
const websocket = socketio(server)

//start server
server.listen(process.env.PORT || 5000,()=>{
    console.log('Listen in the port ',process.env.PORT)
})

const Chat=require('./models/Chat')
const User = require('./models/User')

var clients = {};
var users = {};

websocket.on('connection',(socket)=>{
    console.log('Websocket Conectado')
    clients[socket.id] = socket;

    console.log(socket.rooms);

    socket.on('userJoined',(chatId,user) => onUserJoined(chatId,user,socket));
    socket.on('message', (chatId,message) => onMessageReceived(chatId,message,socket));

})

async function onUserJoined(chatId,userId,socket){
    try{
        if(!userId){

        }else{
            console.log('User ID :', userId)
            console.log('Chat ID :', chatId)

            users[socket.id] = userId;


            console.log("Socket ID: ",socket.id)
            console.log("User ID: ",users[socket.id])

            await socket.join(chatId)

            _sendExistingMessages(chatId,socket);
        }
    }catch (error){
        console.error(error)
    }
}

function  onMessageReceived(chatId,message, senderSocket){
    //var userId = users[senderSocket.id];
    console.log('Mensaje recibido')

    _sendAndSaveMessage(chatId,message,senderSocket);
}

function _sendExistingMessages(chatId,socket){

    console.log("Chat ID send: ",chatId)

    Chat.findById(chatId,function(err,messages){
        if (err) {
            //res.send(err);
            // Devolvemos el código HTTP 404, de usuario no encontrado por su id.
            console.error(err)
            socket.in(chatId).emit('message',err)
        } else {
            // Devolvemos el código HTTP 200.
            socket.in(chatId).emit('message',messages.Messages)
        }
    })
        .sort({createdAt :1})
        .populate({
            path: 'Messages',
            populate :{
                path: 'user',
                model: 'users'
            }
        })


   /* db.collection('messages')
        .find({_id:chatId})

        .toArray((err,messages)=>{
            socket.emit('message',messages.reverse())
        });*/



}

function _sendAndSaveMessage(chatId,message,socket, fromServer){
    var Messages ={
        text:message.text,
        user : message.user,
        createdAt : new Date(message.createdAt),
        chatId:chatId
    }
    console.log("Mensaje Recibido y Guardado")

    Chat.findByIdAndUpdate(chatId,{$push:{ Messages }} , function (err) {

        var emitter = fromServer ? websocket : socket.broadcast;

        if (err) {
            emitter.in(chatId).emit('message',err)
        } else {
            emitter.in(chatId).emit('message',[Messages])
        }
    });

    var stdin = process.openStdin();
    stdin.addListener('data' , function (d){
        _sendAndSaveMessage({
            text : d.toString().trim(),
            createdAt: new Date(),
            user: {_id: 'robot'}

        },null ,true)
    })
}
