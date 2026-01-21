export const rooms = {};

function randomId() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function createDeck() {
  return shuffle([
    1, 2, 3, -1, -2, -3, 5, -5,
    { type: "item", name: "Щит" },
    { type: "item", name: "Второй шанс" },
    { type: "item", name: "Удвоитель" },
    1, 2, -1, 3
  ]);
}

export function createRoom(socket, name) {
  const id = randomId();
  const room = {
    id,
    players: [{
      id: socket.id,
      name,
      score: 5,
      items: [],
      usedItem: false
    }],
    deck: createDeck(),
    turn: 0,
    log: [],
    gameOver: false
  };

  rooms[id] = room;
  return room;
}

export function joinRoom(roomId, socket, name) {
  const room = rooms[roomId];
  if (!room || room.gameOver) return null;

  room.players.push({
    id: socket.id,
    name,
    score: 5,
    items: [],
    usedItem: false
  });

  return room;
}

export function drawCard(roomId, socketId) {
  const room = rooms[roomId];
  if (room.gameOver) return room;

  const player = room.players[room.turn];
  if (player.id !== socketId) return room;

  player.usedItem = false;
  let card = room.deck.pop();

  if (typeof card === "object") {
    if (player.items.length < 2) {
      player.items.push(card.name);
      room.log.push(`${player.name} получил предмет: ${card.name}`);
    } else {
      room.log.push(`${player.name} сбросил предмет (карманы полны)`);
    }
  } else {
    let value = card;
    if (player.double) {
      value *= 2;
      player.double = false;
    }

    player.score += value;
    room.log.push(`${player.name} вытянул ${value}`);
  }

  if (player.score <= 0) {
    room.gameOver = true;
    room.loser = player.name;
    return room;
  }

  if (player.score >= 30) {
    room.gameOver = true;
    room.winner = player.name;
    return room;
  }

  room.turn = (room.turn + 1) % room.players.length;
  return room;
}

export function useItem(roomId, socketId, item) {
  const room = rooms[roomId];
  if (room.gameOver) return room;

  const player = room.players.find(p => p.id === socketId);
  if (!player || player.usedItem) return room;

  const idx = player.items.indexOf(item);
  if (idx === -1) return room;

  if (item === "Щит") {
    player.shield = true;
    room.log.push(`${player.name} активировал Щит`);
  }

  if (item === "Удвоитель") {
    player.double = true;
    room.log.push(`${player.name} активировал Удвоитель`);
  }

  if (item === "Второй шанс") {
    room.turn = (room.turn - 1 + room.players.length) % room.players.length;
    room.log.push(`${player.name} получит второй ход`);
  }

  player.items.splice(idx, 1);
  player.usedItem = true;

  return room;
}
