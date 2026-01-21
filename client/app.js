const socket = io();
let roomId = null;

function createRoom() {
  socket.emit("create_room", document.getElementById("name").value);
}

function joinRoom() {
  socket.emit("join_room", {
    name: document.getElementById("name").value,
    roomId: document.getElementById("roomCode").value
  });
}

function draw() {
  socket.emit("draw_card", roomId);
}

function useItem(item) {
  socket.emit("use_item", { roomId, item });
}

socket.on("room_joined", room => {
  roomId = room.id;
  render(room);
});

socket.on("update", render);

function render(room) {
  roomId = room.id;
  const me = socket.id;
  const current = room.players[room.turn];

  document.getElementById("game").innerHTML = `
    <h2>Комната ${room.id}</h2>
    <h3>${room.gameOver
      ? room.winner ? "🏆 Победил: " + room.winner : "💀 Проиграл: " + room.loser
      : "Ход: " + current.name}
    </h3>

    <ul>
      ${room.players.map(p => `
        <li>
          ${p.name}: ${p.score}<br>
          ${p.items.map(i =>
            p.id === me && !room.gameOver
              ? `<button onclick="useItem('${i}')">${i}</button>`
              : i
          ).join(" ")}
        </li>
      `).join("")}
    </ul>

    ${!room.gameOver && current.id === me
      ? `<button onclick="draw()">Вытянуть карту</button>`
      : ""}
  `;
}
