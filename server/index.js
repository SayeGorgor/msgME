const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    socket.on('send_message', (message) => {
        const { id, senderID, content, timestamp, conversationID } = message;
        const messageData = { id, senderID, content, timestamp }
        console.log('Message Data: ', message);
        socket.to(conversationID).emit('received_message', messageData);
        io.to(conversationID).emit('update_last_message', {
            newLastMessage: content,
            conversationIDCheck: conversationID
        });
    });

    socket.on('join_room', (conversationID) => {
        console.log('Joined room: ', conversationID);
        socket.join(conversationID);
    });

    socket.on('leave_room', (conversationID) => {
        socket.leave(conversationID);
    })
})

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})