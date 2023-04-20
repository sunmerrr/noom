import express from "express";

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

const handleListen = () => console.log("Listening on http://localhost:3000");
app.listen(3000, handleListen);
