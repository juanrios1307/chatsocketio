const express=require('express')
const http = require('http')
const socketio = require('socket.io')
const mongojs = require('mongojs')

var ObjectID = mongojs.ObjectID

//var db = mongojs('mongodb+srv://admin:MongoAtlasDB@cluster0.lhtsk.gcp.mongodb.net/tripmates?retryWrites=true&w=majority')

const app=express()
const server = http.Server()
const websocket = socketio(server)

app.set('Port',5000)

//start server
app.listen(process.env.PORT || 5000,()=>{
    console.log('Listen in the port ',process.env.PORT)
})

var clients = {};
var users = {};

var chatId =1;

websocket.on('connection',(socket)=>{
    clients[socket.id] = socket;
    socket.on('userJoined',(user) => onUserJoined(userId,socket));
    socket.on('message', (message) => onMessageReceived(message,socket));

})

function onUserJoined(userId,socket){
    try{
        if(!userId){

        }else{
            users[socket.id] = userId;
            _sendExistingMessages(socket);
        }
    }catch (error){
        console.err(err)
    }
}

function  onMessageReceived(message, senderSocket){
    var userId = users[senderSocket.id];

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
            text:'hola'
        },
        {
            _id:2,
            text:'jaja'
        }
        ]

    socket.emit('message',messages)
}

function _sendAndSaveMessage(message,socket, fromServer){
    var messageData ={
        text:message.text,
        user : message.user,
        createdAt : new Date(mesage.createdAt),
        chatId:chatId
    }

    /*db.collection('messages').insert(messageData,(err,message) =>{
        var emitter = fromServer ? websocket : socket.broadcast;
        emitter.emit('message',[message])
    })*/

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
