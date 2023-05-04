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

// 1. 연결이 끊어지면 자동을 재연결 시도
// 2. websocket을 사용할 수 없으면 다른 라이브러리 이용함

function publicRooms() {
  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined){
      publicRooms.push(key)
    }
  });
  console.log('publicRooms', publicRooms)
  return publicRooms;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size
}

// socket.io 로 소통하기
io.on('connection', socket => {
  socket["nickname"] = "Anon"
  socket.onAny(event => {
    console.log(`Socket Event:`, io.sockets.adapter.rooms)
  });

  socket.on('enter_room', (roomName, done) => {
    console.log('countRoom', countRoom(roomName))
    socket.join(roomName); // socket.leave() , socket.to().to().emit()
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms())
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) -1)
    })
  })

  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms())
  })

  socket.on("new_message", (msg, room, done) => {
    console.log('message', msg)
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  })

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname
  })
});



// websocket 으로 소통하기

// const WebSocketServer = new WebSocket.Server({ server });
// const sockets = [];
// WebSocketServer.on('connection', soscket => {
//   sockets.push(socket);
//   socket['nickname'] = 'Anonymous'; // socket에 데이터 저장하기
//   console.log('Connected to Browser');
//   socket.on('close', () => console.log('Desconnected from the Browser'));

//   socket.on('message', message => {
//     const messageParsed = JSON.parse(message.toString());

//     switch (messageParsed.type) {
//       case 'new_message':
//         sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${messageParsed.payload}`));
//         return;
//       case 'nickname':
//         socket.nickname = messageParsed.payload;
//     }
//   });
// });

server.listen(3000, handleListen);
