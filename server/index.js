import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createRoom,
  joinRoom,
  drawCard,
  useItem
} from "./rooms.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("client"));

io.on("connection", socket => {

  socket.on("create_room", name => {
    const room = createRoom(socket, name);
    socket.join(room.id);
    socket.emit("room_joined", room);
  });

  socket.on("join_room", ({ roomId, name }) => {
    const room = joinRoom(roomId, socket, name);
    if (room) {
      socket.join(roomId);
      io.to(roomId).emit("update", room);
    }
  });

  socket.on("draw_card", roomId => {
    const room = drawCard(roomId, socket.id);
    io.to(roomId).emit("update", room);
  });

  socket.on("use_item", ({ roomId, item }) => {
    const room = useItem(roomId, socket.id, item);
    io.to(roomId).emit("update", room);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
});
