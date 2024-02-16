const express = require("express");
const app = express();
const http = require("http").Server(app);  
const { v4: uuidv4 } = require("uuid");
const io = require('socket.io')(http, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  });
  

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(http, { debug: true });
app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId);
      socket.on('message', (message) => {
        io.to(roomId).emit('createMessage', message)
    }); 
  
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId)
      })
    })
  })


  
const PORT = process.env.PORT || 8080;

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
