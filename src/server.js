import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui'

const app = express();

// pugfh view 엔진 설정
app.set('view engine', 'pug');

// express에 templet이 어디에 있는지 알려줌
app.set('views', __dirname + '/views');

// public 설정해서 user에게 경로 지정
app.use('/public', express.static(__dirname + '/public'));

// pug.home 을 rendering 해주는 router
app.get('/', (req, res) => res.render('home'));
app.get('/*', ( req, res) => res.redirect('/'));

// websocket 서버만 사용하고 싶으면 ws://localhost:3000 를 사용해도 됨
const handleListen = () => console.log('Listening on http://localhost:3000');
// app.listen(3000, handleListen);

// websocket server를 http 서버 위에 설정
// 같은 포트 넘버를 사용하기 위해서 함께 설정함
const server = http.createServer(app);
const io = new Server(server,  {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false,
  mode: "development",
});

io.on("connection", socket => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome")
  })
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer)
  });
  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer)
  })
  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice)
  })
})

server.listen(3000, handleListen);
