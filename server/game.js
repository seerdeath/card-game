export function createDeck() {
  const deck = [1, 2, 3, -1, -2, -3, 5, -5];
  return deck.sort(() => Math.random() - 0.5);
}
