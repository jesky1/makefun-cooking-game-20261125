// DAPUR KILAT — entry point. Owns the game object, the fixed-step loop,
// the screen state machine (title -> play -> over) and every interaction
// between chef, stations and the order board. Rendering lives in render.js;
// the ?shot= scenes live in shots.js and are staged through this same state.

import { CHEF, COLORS, LAYOUT, SHIFT_SECONDS, STEP, VIEW, HUD, INGREDIENTS, RUSH_AT } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createChef } from './chef.js';
import { createStations } from './stations.js';
import { createOrderBoard } from './orders.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER, drawWorld, drawTitle, drawOver } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

// Fit the logical 1280x800 view into the window, letterboxed.
function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = Math.round(VIEW.width * scale);
  canvas.height = Math.round(VIEW.height * scale);
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const input = createInput(canvas);
// Convert pointer coordinates into logical game space.
input.toLogical = (clientX, clientY) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW.width,
    y: ((clientY - rect.top) / rect.height) * VIEW.height,
  };
};

const world = {
  screen: SCREEN_TITLE,
  chef: createChef(),
  stations: createStations(),
  board: createOrderBoard(Math.random),
  input,
  audio: createAudio(),
  coins: 0,
  combo: 0,
  bestCombo: 0,
  timeLeft: SHIFT_SECONDS,
  shiftSeconds: SHIFT_SECONDS,
  elapsed: 0,
  rush: false,
  particles: [],
  floaters: [],
  shake: 0,
  nearStationId: null,
  lastServe: '',
  lastServeT: 0,
  stars: 0,
  steamTimer: 0,
};

world.addFloater = (x, y, text, color) => {
  world.floaters.push({ x, y, text, color: color || '#fff3d6', life: 1.4, maxLife: 1.4 });
};

world.burst = (x, y, color, count) => {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 90;
    world.particles.push({
      x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      life: 0.6 + Math.random() * 0.4, maxLife: 1,
      color, size: 3 + Math.random() * 4,
    });
  }
};

world.steam = (x, y) => {
  world.particles.push({
    x: x + (Math.random() - 0.5) * 20, y,
    vx: (Math.random() - 0.5) * 10, vy: -28 - Math.random() * 14,
    life: 0.9, maxLife: 0.9, color: 'rgba(255,255,255,0.75)', size: 5 + Math.random() * 4,
  });
};

// Fresh state for a new shift; the title screen stages a lively kitchen
// over the same state so the game never opens on an empty room.
world.resetFresh = () => {
  world.chef.reset();
  world.stations.reset();
  world.board.reset();
  world.coins = 0;
  world.combo = 0;
  world.bestCombo = 0;
  world.timeLeft = SHIFT_SECONDS;
  world.elapsed = 0;
  world.rush = false;
  world.particles = [];
  world.floaters = [];
  world.shake = 0;
  world.lastServe = '';
  world.stars = 0;
  // Truly fresh: no demo food on the stations. The title screen stages
  // its own lively kitchen through stageShot('start') instead, so a real
  // shift never starts with food already cooking (and burning).
};

world.startShift = () => {
  world.resetFresh();
  world.screen = SCREEN_PLAY;
  world.audio.unlock();
};

world.endShift = () => {
  world.screen = SCREEN_OVER;
  world.stars = world.coins >= 220 ? 3 : world.coins >= 130 ? 2 : world.coins >= 60 ? 1 : 0;
  world.audio.done();
};

// --- interaction -------------------------------------------------------------
function applyInteract(stationId) {
  const res = world.stations.interact(stationId, world.chef.carry);
  const audio = world.audio;
  if (!res.ok) {
    if (res.action === 'hands-full' || res.action === 'wrong-station' || res.action === 'burnt') {
      audio.error();
      world.shake = Math.max(world.shake, 4);
    }
    return;
  }
  if (res.action === 'serve-attempt') {
    const plate = world.chef.carry;
    const order = world.board.match(plate.contents);
    if (order) {
      const earned = world.board.serve(order, world.combo);
      world.coins += earned;
      world.combo += 1;
      world.bestCombo = Math.max(world.bestCombo, world.combo);
      world.chef.carry = null;
      world.lastServe = `+${earned} — ${order.recipe.name}!`;
      world.lastServeT = 2.5;
      audio.serve();
      const w = LAYOUT.window;
      world.burst(w.x + w.w / 2, w.y + 60, '#ffd76a', 18);
      world.addFloater(w.x + w.w / 2, w.y - 6, `+${earned}`, '#ffd76a');
    } else {
      audio.error();
      world.shake = 8;
      world.combo = 0;
      const w = LAYOUT.window;
      world.addFloater(w.x + w.w / 2, w.y - 6, 'Bukan pesanan itu!', '#ff6b6b');
    }
    return;
  }
  if ('carry' in res) world.chef.carry = res.carry;
  if (res.action === 'take' || res.action === 'take-cooked' || res.action === 'plate-pickup') audio.pickup();
  else if (res.action === 'place' || res.action === 'plate-add' || res.action === 'trash' || res.action === 'trash-plate') audio.place();
}

// Clicking a station walks the chef there and interacts on arrival.
canvas.addEventListener('pointerdown', (event) => {
  const point = input.toLogical(event.clientX, event.clientY);
  if (world.screen !== SCREEN_PLAY) return;
  const near = world.stations.nearest(point.x, point.y, 60);
  if (near) world.chef.goToStation(input, world.stations, near.id);
});

// --- fixed-step update ---------------------------------------------------------
function step(dt) {
  const audio = world.audio;
  if (input.consume('mute')) audio.muted = !audio.muted;

  if (world.screen === SCREEN_TITLE) {
    // The staged title kitchen stays frozen as pictured; a real shift
    // starts clean through startShift().
    if (input.consume('start')) world.startShift();
    input.endStep();
    return;
  }
  if (world.screen === SCREEN_OVER) {
    if (input.consume('start')) world.startShift();
    input.endStep();
    return;
  }

  // --- play ---
  world.elapsed += dt;
  world.timeLeft -= dt;
  const wasRush = world.rush;
  world.rush = world.timeLeft <= RUSH_AT && world.timeLeft > 0;
  if (world.rush && !wasRush) {
    audio.rush();
    world.addFloater(VIEW.width / 2, 200, 'RUSH! Pesanan makin cepat!', '#ff9a9a');
  }
  if (world.timeLeft <= 10 && world.timeLeft > 0 && Math.floor(world.timeLeft) !== Math.floor(world.timeLeft + dt)) {
    audio.tick();
  }

  // Orders: expiry walks customers out and breaks the combo.
  const walkedOut = world.board.step(dt, world.elapsed, world.rush);
  for (const order of walkedOut) {
    world.combo = 0;
    audio.expire();
    world.addFloater(220, 60, `${order.recipe.name} kabur! -10`, '#ff6b6b');
    world.coins = Math.max(0, world.coins - 10);
  }

  // Prep stations: chopping / cooking finish, food burns.
  const events = world.stations.step(dt);
  for (const ev of events) {
    if (ev.type === 'done') {
      audio.done();
      const rect = ev.station === 'board' ? LAYOUT.board : ev.station === 'grill' ? LAYOUT.grill : LAYOUT.pot;
      world.burst(rect.x + rect.w / 2, rect.y + 60, '#8dff9e', 8);
    } else if (ev.type === 'burnt') {
      audio.error();
      const rect = ev.station === 'grill' ? LAYOUT.grill : LAYOUT.pot;
      world.addFloater(rect.x + rect.w / 2, rect.y - 8, 'GOSONG!', '#ff6b6b');
    }
  }

  // Ambient steam from hot stations.
  world.steamTimer -= dt;
  if (world.steamTimer <= 0) {
    world.steamTimer = 0.16;
    for (const slot of world.stations.grill.slots) {
      if (slot.item) world.steam(LAYOUT.grill.x + 60 + (world.stations.grill.slots.indexOf(slot) * 100), LAYOUT.grill.y + 46);
    }
    for (const slot of world.stations.pot.slots) {
      if (slot.item) world.steam(LAYOUT.pot.x + LAYOUT.pot.w / 2, LAYOUT.pot.y + 44);
    }
  }

  // Chef movement + arrival interaction.
  const arrivedAt = world.chef.step(dt, input, world.stations);
  if (arrivedAt) applyInteract(arrivedAt);
  if (input.consume('interact')) {
    const near = world.chef.nearStation(world.stations);
    if (near) applyInteract(near.id);
  }

  // Particles, floaters, shake.
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const pt = world.particles[i];
    pt.life -= dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 40 * dt;
    if (pt.life <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.floaters.length - 1; i >= 0; i -= 1) {
    const f = world.floaters[i];
    f.life -= dt;
    f.y -= 26 * dt;
    if (f.life <= 0) world.floaters.splice(i, 1);
  }
  world.shake = Math.max(0, world.shake - dt * 30);
  if (world.lastServeT > 0) {
    world.lastServeT -= dt;
    if (world.lastServeT <= 0) world.lastServe = '';
  }

  const near = world.chef.nearStation(world.stations);
  world.nearStationId = near ? near.id : null;

  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.endShift();
  }
  input.endStep();
}

// --- render + loop ---------------------------------------------------------------
function render() {
  ctx.setTransform(canvas.width / VIEW.width, 0, 0, canvas.height / VIEW.height, 0, 0);
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  if (world.screen === SCREEN_TITLE) drawTitle(ctx, world);
  else if (world.screen === SCREEN_OVER) drawOver(ctx, world);
  else drawWorld(ctx, world);
  // Screen-reader status line.
  if (statusEl) {
    statusEl.textContent = world.screen === SCREEN_PLAY
      ? `Dapur Kilat: ${world.coins} koin, ${world.board.served} pesanan disajikan, ${Math.ceil(world.timeLeft)} detik lagi.`
      : 'Dapur Kilat';
  }
}

let last = performance.now();
let acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard < 8) {
    step(STEP);
    acc -= STEP;
    guard += 1;
  }
  render();
  requestAnimationFrame(frame);
}

// --- boot ------------------------------------------------------------------------
// Exposed for local play-testing through the devtools console; not used by the game.
window.__world = world;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  // Screenshot mode: stage a real game state, render once, signal readiness.
  stageShot(shot, world);
  render();
  window.__shotReady = true;
} else {
  // The title screen opens over the staged 'start' kitchen.
  stageShot('start', world);
  requestAnimationFrame(frame);
}
