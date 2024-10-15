import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const menssagesList = [];
const app = express();
const server = http.createServer(app);
const userMap = new Map();

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.get('/', (req, res) => {
    res.send('<h1>Hola server client</h1>');
})

io.on('connection', (socket) => {

    socket.on('userRegister', (data) => {
        userMap.set(socket.id, {
            "username": data,
            "usernameId": socket.id
        });
        console.log('username: ' + data + ', username id: ' + socket.id);
        console.log(userMap)

        socket.emit('updateUser', Array.from(userMap));
        socket.broadcast.emit('updateUser', Array.from(userMap));
    })

    socket.on('newMessage', (msg) => {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        let username = userMap.get(socket.id);
        socket.emit('respuestaServidor', { user: username.username, message: msg });
        socket.broadcast.emit('respuestaServidor', { user: username.username, message: msg });
        menssagesList.push(['User: ' + username.username + ' Message: ' + msg + ' Date: ' + date + ' Time: ' + time])
    });

    socket.on('disconnect', () => {
        userMap.delete(socket.id);
        socket.emit('updateUser', Array.from(userMap));
        socket.broadcast.emit('updateUser', Array.from(userMap));

        console.log('user disconecter: ' + socket.id)
    })
})

server.listen(3000, () => {
    console.log('server listen on port : 3000')
});
