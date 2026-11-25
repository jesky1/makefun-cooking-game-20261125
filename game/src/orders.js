// The order board: tickets come in, wait with a draining patience bar,
// and pay out when a matching plate is served. This module owns spawning,
// expiry and the serve match; the chef and stations only hand it plates.

import { ORDER, RECIPES, plateKey, recipeKey } from './config.js';

let nextId = 1;

export function createOrderBoard(random) {
  const board = {
    open: [],          // { id, recipe, patience, patienceMax, bornAt }
    spawnTimer: ORDER.spawnEvery,
    random,
    served: 0,
    expired: 0,
  };

  function pickRecipe() {
    const index = Math.floor(board.random() * RECIPES.length);
    return RECIPES[index];
  }

  board.spawn = (patience) => {
    if (board.open.length >= ORDER.maxOpen) return null;
    const recipe = pickRecipe();
    const order = {
      id: nextId,
      recipe,
      patience,
      patienceMax: patience,
      bornAt: 0,
    };
    nextId += 1;
    board.open.push(order);
    return order;
  };

  // Advance timers; returns 'expired' order ids that walked out this step.
  board.step = (dt, elapsed, rush) => {
    const walkedOut = [];
    for (let i = board.open.length - 1; i >= 0; i -= 1) {
      const order = board.open[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        board.open.splice(i, 1);
        board.expired += 1;
        walkedOut.push(order);
      }
    }
    board.spawnTimer -= dt;
    if (board.spawnTimer <= 0) {
      board.spawnTimer = rush ? ORDER.spawnEveryRush : ORDER.spawnEvery;
      board.spawn(rush ? ORDER.patienceRush : ORDER.patience);
    }
    return walkedOut;
  };

  // A plate matches an order when its contents are exactly the recipe's
  // multiset (same kinds, same states, no extras, no shortages).
  board.match = (contents) => {
    const key = plateKey(contents);
    for (const order of board.open) {
      if (recipeKey(order.recipe) === key) return order;
    }
    return null;
  };

  // Serve a matching plate: removes the ticket, pays base reward plus a
  // patience bonus scaled by the combo, and returns the coins earned.
  board.serve = (order, combo) => {
    const index = board.open.indexOf(order);
    if (index === -1) return 0;
    board.open.splice(index, 1);
    board.served += 1;
    const patienceBonus = Math.round(10 * (order.patience / order.patienceMax));
    const multiplier = Math.min(2, 1 + 0.1 * Math.max(0, combo - 1));
    return Math.round((order.recipe.reward + patienceBonus) * multiplier);
  };

  board.reset = () => {
    board.open = [];
    board.spawnTimer = ORDER.spawnEvery;
    board.served = 0;
    board.expired = 0;
    for (let i = 0; i < ORDER.firstOrders; i += 1) board.spawn(ORDER.patience);
  };

  return board;
}
