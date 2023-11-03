const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const router = require('./Router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const cors = require('cors');

const app = express();  //initializing express app


const server = http.createServer(app);

//const io = socketio(server);
app.use(cors());
app.use(router);


const io = socketio(server,{
    cors: {  // initialized cores policy(cross platform)
        origin: '*',
        
      },
     

});

io.on("connection", (socket)=>{
    console.log('We are connected!!!!');

    socket.on('join',({name,room},callback)=>{
       const  {error , user}=addUser({id:socket.id,name,room});   //user with unique id , name and room
        if(error) return callback(error);

        socket.join(user.room);

     
         socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});   //system generated   (emitted event from backened to frontened)
         socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
         io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        

        callback();

    });
    
  socket.on('sendMessage', (message, callback) => {   //user generated  (will wait message from frontened)
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });
  console.log("working till here");

    

    socket.on('disconnect',()=>{
        console.log('User had left');
        const user = removeUser(socket.id);
        if(user) {
          io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
          io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    })
    }); 



server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));