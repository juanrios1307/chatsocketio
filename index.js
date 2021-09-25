const express=require('express')
const http = require('http')
const socketio = require('socket.io')
const mongojs = require('mongojs')

var ObjectID = mongojs.ObjectID

//var db = mongojs('mongodb+srv://admin:MongoAtlasDB@cluster0.lhtsk.gcp.mongodb.net/tripmates?retryWrites=true&w=majority')

const app=express()
const server = http.Server(app)
const websocket = socketio(server)

//start server
server.listen(process.env.PORT || 5000,()=>{
    console.log('Listen in the port ',process.env.PORT)
})

var clients = {};
var users = {};

var chatId =1;

websocket.on('connection',(socket)=>{
    console.log('Websocket Conectado')
    clients[socket.id] = socket;
    socket.on('userJoined',(user) => onUserJoined(user,socket));
    socket.on('message', (message) => onMessageReceived(message,socket));

})

function onUserJoined(userId,socket){
    try{
        if(!userId){
            console.log('No ID')
            users[socket.id] = userId;
            _sendExistingMessages(socket);
        }else{
            console.log('SI ID')
            users[socket.id] = userId;
            _sendExistingMessages(socket);
        }
    }catch (error){
        console.error(err)
    }
}

function  onMessageReceived(message, senderSocket){
    var userId = users[senderSocket.id];
    console.log('Mensaje recibido')
    _sendAndSaveMessage(message,senderSocket);
}

function _sendExistingMessages(socket){
    /*var messages = db.collection('messages')
        .find({_id:chatId})
        .sort({createdAt : 1})
        .toArray((err,messages)=>{
            socket.emit('message',messages.reverse())
        });*/

    messages=[
        {
            _id:1,
            text:'hola',
            user :{_id:1},
            createdAt : new Date(),
            chatId:1
        },
        {
            _id:2,
            text:'Prueba Chat',
            user :{_id:-1},
            createdAt : new Date(),
            chatId:1
        }
        ]
    console.log("Mensajes A Enviar: ",messages)
    socket.emit('message',messages)
}

function _sendAndSaveMessage(message,socket, fromServer){
    var messageData ={
        text:message.text,
        user : message.user,
        createdAt : new Date(message.createdAt),
        chatId:chatId
    }

    /*db.collection('messages').insert(messageData,(err,message) =>{
        var emitter = fromServer ? websocket : socket.broadcast;
        emitter.emit('message',[message])
    })*/
    console.log("Mensaje Recibido y Guardado",message)
    var emitter = fromServer ? websocket : socket.broadcast;
    emitter.emit('message',[messageData])

    var stdin = process.openStdin();
    stdin.addListener('data' , function (d){
        _sendAndSaveMessage({
            text : d.toString().trim(),
            createdAt: new Date(),
            user: {_id: 'robot'}

        },null ,true)
    })
}
