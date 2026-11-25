// Screenshot scenes for ?shot=start|play|serve|end.
// Each scene builds a real game state out of the real rules — orders on the
// board, food on the stations, a plate mid-assembly — then the normal
// renderer draws it. Nothing here draws pixels of its own, so every
// screenshot is a render of the game's own code, and the same scene always
// gives the same frame.

import { RECIPES } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';

let shotOrderId = 1000;

function makeOrder(recipeId, patience, patienceMax) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return { id: shotOrderId, recipe, patience, patienceMax };
}

function putSlot(stations, group, index, kind, state, progress, done) {
  const slot = stations[group].slots[index];
  slot.item = { kind, state };
  slot.progress = progress;
  slot.done = done;
  slot.burnt = false;
  slot.overTime = 0;
}

/**
 * Stage the named scene on `world` (the game object from main.js) and
 * return the screen it should draw. Unknown names fall back to start.
 */
export function stageShot(name, world) {
  world.resetFresh();
  if (name === 'play') {
    world.screen = SCREEN_PLAY;
    world.timeLeft = 132;
    world.elapsed = 48;
    world.coins = 120;
    world.combo = 3;
    world.bestCombo = 3;
    world.board.open = [
      makeOrder('burger', 40, 70),
      makeOrder('salad', 18, 70),
      makeOrder('pasta', 55, 70),
    ];
    // One dish mid-assembly on the plating counter: bun + grilled patty
    // + chopped lettuce, waiting on its tomato.
    world.stations.plate.contents = [
      { kind: 'roti', state: 'mentah' },
      { kind: 'patty', state: 'panggang' },
      { kind: 'selada', state: 'potong' },
    ];
    putSlot(world.stations, 'board', 0, 'selada', 'potong', 1, true);
    putSlot(world.stations, 'board', 1, 'tomat', 'mentah', 0.6, false);
    putSlot(world.stations, 'grill', 0, 'patty', 'panggang', 1, true);
    putSlot(world.stations, 'grill', 1, 'patty', 'mentah', 0.7, false);
    putSlot(world.stations, 'pot', 0, 'pasta', 'mentah', 0.8, false);
    world.chef.x = 410;
    world.chef.y = 300;
    world.chef.dirX = 0;
    world.chef.dirY = 1;
    world.chef.carry = { type: 'item', item: { kind: 'tomat', state: 'mentah' } };
    world.nearStationId = 'board';
    world.steam(640, 180);
    world.steam(900, 180);
    return SCREEN_PLAY;
  }

  if (name === 'serve') {
    world.screen = SCREEN_PLAY;
    world.timeLeft = 98;
    world.elapsed = 82;
    world.coins = 165;
    world.combo = 4;
    world.bestCombo = 4;
    world.board.open = [
      makeOrder('burger', 30, 70),
      makeOrder('sandwich', 48, 70),
    ];
    // A complete burger on a plate, carried to the serve window.
    world.chef.x = 1158;
    world.chef.y = 372;
    world.chef.dirX = 1;
    world.chef.dirY = 0;
    world.chef.carry = {
      type: 'plate',
      contents: [
        { kind: 'roti', state: 'mentah' },
        { kind: 'patty', state: 'panggang' },
        { kind: 'selada', state: 'potong' },
        { kind: 'tomat', state: 'potong' },
      ],
    };
    putSlot(world.stations, 'board', 0, 'tomat', 'potong', 1, true);
    putSlot(world.stations, 'grill', 0, 'patty', 'mentah', 0.4, false);
    world.lastServe = '+45 — Burger Kilat!';
    world.lastServeT = 2.5;
    world.nearStationId = 'window';
    world.addFloater(1158, 320, '+45', '#ffd76a');
    return SCREEN_PLAY;
  }

  if (name === 'end') {
    world.screen = SCREEN_OVER;
    world.timeLeft = 0;
    world.coins = 245;
    world.combo = 0;
    world.bestCombo = 4;
    world.board.served = 9;
    world.board.expired = 1;
    world.stars = 3;
    world.board.open = [];
    world.chef.x = 120;
    world.chef.y = 700;
    return SCREEN_OVER;
  }

  // start (default): the title screen over a kitchen already at work —
  // orders on the board, a patty on the grill, lettuce on the board and a
  // half-built burger on the plating counter.
  world.screen = SCREEN_TITLE;
  world.stations.plate.contents = [
    { kind: 'roti', state: 'mentah' },
    { kind: 'patty', state: 'panggang' },
  ];
  world.chef.x = 250;
  world.chef.y = 540;
  world.chef.dirX = 1;
  world.chef.dirY = 0;
  return SCREEN_TITLE;
}
