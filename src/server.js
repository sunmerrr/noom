import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

// pugfh view 엔진 설정
app.set("view engine", "pug");

// express에 templet이 어디에 있는지 알려줌
app.set("views", __dirname + "/views");

// public 설정해서 user에게 경로 지정
app.use("/public", express.static(__dirname + "/public"));

// pug.home 을 rendering 해주는 router
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"))

// websocket 서버만 사용하고 싶으면 ws://localhost:3000 를 사용해도 됨
const handleListen = () => console.log("Listening on http://localhost:3000");
// app.listen(3000, handleListen);


// websocket server를 http 서버 위에 설정
// 같은 포트 넘버를 사용하기 위해서 함께 설정함
const server = http.createServer(app);
const WebSocketServer = new WebSocket.Server({server});

const sockets = [];

WebSocketServer.on("connection", (socket) => {
  sockets.push(socket)
  socket["nickname"] = "Anonymous" // socket에 데이터 저장하기
  console.log("Connected to Browser");
  socket.on("close", () => console.log("Desconnected from the Browser"))

  socket.on("message", (message) => {
    const messageParsed = JSON.parse(message.toString())

    switch(messageParsed.type) {
      case "new_message":
        sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${messageParsed.payload}`))
        return
      case "nickname":
        socket.nickname = messageParsed.payload
    }
  });
});

server.listen(3000, handleListen)