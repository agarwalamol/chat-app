const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users') //importing functions for tracking users an rooms

const {generatedMessage, generateLocationMessage}  = require('../src/utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count =0

// io.on('connection', (socket) => {

//     console.log('new websocket connection!')
//     socket.emit('updatedCount', count)   //updatedCount is an event

//     socket.on('increment',()=>{
//         count++
//         //socket.emit('updatedCount', count)    //emits event to only the current connection, not all of them.
//         io.emit('updatedCount',count)
//     })
// })

io.on('connection',(socket)=>{
    // {                        //we can return an object from emit
    // socket.emit('message',{
    //     text: 'Welcome',
    //     createdAt: new Date().getTime
    // }
    
    // socket.emit('message', generatedMessage('Welcome'))
    
    // socket.broadcast.emit('message',generatedMessage('A new user has joined!')) //send msg to all users except yourself

    socket.on('join', ({username, room}, callback)=>{
        const {error, user}= addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)       //join a room
        socket.emit('message', generatedMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generatedMessage('Admin',`${user.username} has joined!`)) //send msg to all users except yourself

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        //io.emit, socket.emit , socket.broadcast.emit
        //io.to.emit  -send event to all in a room, socket.broadcast.to.emit --send event to all in a room leaving itself
    })

    const filter = new Filter()
        socket.on('sendMessage',(msg, callback)=>{
        if(filter.isProfane(msg)){      //blocking bad words using the bad-words npm library
            return callback('No Bad words please!')
        }
        const user= getUser(socket.id)
        io.to(user.room).emit('message', generatedMessage(user.username,msg))
        callback('Delivered')       //event acknowledgement 
        
    })


    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        /* we shoud use conditional logic to ensure that the person disconnecting was actually part of a room
        before sending the message that a user has left. if he was not connected to a room, there's no need of any 
        disconnection message to users.
         */
        
        if(user){
            io.to(user.room).emit('message',generatedMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })

    socket.on('sendLocation',(loc, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${loc.latitude},${loc.longitude}`))
        callback()
    })

})


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



