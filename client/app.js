const socket = io();
let roomId = null;

function createRoom() {
  const name = document.getElementById("name").value;
  socket.emit("create_room", name);
}

socket.on("room_joined", (room) => {
  roomId = room.id;
  render(room);
});

socket.on("room_update", (room) => {
  render(room);
});

function draw() {
  socket.emit("draw_card", roomId);
}

function render(room) {
  document.getElementById("game").innerHTML = `
    <h2>Комната: ${room.id}</h2>
    <ul>${room.players.map(p => `<li>${p.name}: ${p.score}</li>`).join("")}</ul>
    <button onclick="draw()">Вытянуть карту</button>
    <pre>${room.log.join("\n")}</pre>
  `;
}
