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
        console.log(message);
        socket.broadcast.emit('received_message', message);
    })
})

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})