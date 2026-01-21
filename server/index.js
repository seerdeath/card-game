import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createRoom,
  joinRoom,
  drawCard,
  useItem
} from "./rooms.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// 🔥 ВАЖНО: правильно отдаём client
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

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
httpServer.listen(PORT, () =>
