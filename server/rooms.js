import { createDeck } from "./game.js";

const rooms = {};

export function createRoom(socketId, name) {
  const id = Math.random().toString(36).substring(2, 7);
  rooms[id] = {
    id,
    players: [{ id: socketId, name, score: 5 }],
    deck: createDeck(),
    turn: 0,
    log: []
  };
  return rooms[id];
}

export function joinRoom(roomId, socketId, name) {
  const room = rooms[roomId];
  if (!room || room.players.length >= 4) return room;
  room.players.push({ id: socketId, name, score: 5 });
  return room;
}

export function drawCard(roomId, socketId) {
  const room = rooms[roomId];
  const player = room.players[room.turn];
  if (player.id !== socketId) return room;

  const card = room.deck.pop();
  player.score += card;
  room.log.push(`${player.name} вытянул ${card}`);
  room.turn = (room.turn + 1) % room.players.length;
  return room;
}
