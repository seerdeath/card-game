import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createRoom, joinRoom, drawCard } from "./rooms.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("client"));

io.on("connection", (socket) => {
  socket.on("create_room", (name) => {
    const room = createRoom(socket.id, name);
    socket.join(room.id);
    socket.emit("room_joined", room);
  });

  socket.on("join_room", ({ roomId, name }) => {
    const room = joinRoom(roomId, socket.id, name);
    socket.join(room.id);
    io.to(room.id).emit("room_update", room);
  });

  socket.on("draw_card", (roomId) => {
    const room = drawCard(roomId, socket.id);
    io.to(room.id).emit("room_update", room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
