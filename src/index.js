const express=require('express')
const http = require('http')
const socketio = require('socket.io')
const mongojs = require('mongojs')
const mongoose =  require('mongoose');

require('./helpers/database')


const app=express()
const server = http.Server(app)
const websocket = socketio(server)

//start server
server.listen(process.env.PORT || 5000,()=>{
    console.log('Listen in the port ',process.env.PORT)
})

const Chat=require('../models/Chat')

var clients = {};
var users = {};

websocket.on('connection',(socket)=>{
    console.log('Websocket Conectado')
    clients[socket.id] = socket;
    socket.on('userJoined',(chatId,user) => onUserJoined(chatId,user,socket));
    socket.on('message', (chatId,message) => onMessageReceived(chatId,message,socket));

})

function onUserJoined(chatId,userId,socket){
    try{
        if(!userId){
            return
        }else{
            console.log('SI ID')
            users[socket.id] = userId;
            _sendExistingMessages(chatId,socket);
        }
    }catch (error){
        console.error(err)
    }
}

function  onMessageReceived(chatId,message, senderSocket){
    var userId = users[senderSocket.id];
    console.log('Mensaje recibido')
    _sendAndSaveMessage(chatId,message,senderSocket);
}

function _sendExistingMessages(chatId,socket){

    Chat.find({_id:chatId},{Messages:1,_id:0},function(err,messages){
        if (err) {
            //res.send(err);
            // Devolvemos el código HTTP 404, de usuario no encontrado por su id.
            socket.emit('message',err)
        } else {
            // Devolvemos el código HTTP 200.
            console.log("Mensajes A Enviar: ",messages)
            socket.emit('message',messages)
        }
    }).sort({createdAt : 1});

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
    console.log("Mensaje Recibido y Guardado",message)

    Chat.update({_id:chatId},{$push:{ Messages }} , function (err) {
        if (err) {

            var emitter = fromServer ? websocket : socket.broadcast;
            emitter.emit('message',err)
        } else {

            var emitter = fromServer ? websocket : socket.broadcast;
            emitter.emit('message',[Messages])
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