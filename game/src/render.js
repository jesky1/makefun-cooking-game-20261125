// Every pixel of DAPUR KILAT, drawn with canvas paths — no image files.
// The kitchen, the food, the chef, the order board and the screens all
// come from this module, so a screenshot is always a render of the game
// itself. All coordinates are the logical 1280x800 space.

import { COLORS, HUD, INGREDIENTS, LAYOUT, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 700} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- Food icons -------------------------------------------------------------
// drawFood draws one ingredient at (x, y), centred, about `size` wide.
// The state changes the drawing: raw patty is pink-red, grilled is brown,
// chopped veg comes in pieces, burnt is charcoal.
export function drawFood(ctx, kind, state, x, y, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'gosong') {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(-s * 0.3, -s * 0.2, s * 0.25, 0, Math.PI * 2);
    ctx.arc(s * 0.3, s * 0.25, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  switch (kind) {
    case 'roti': {
      ctx.fillStyle = '#e8b25c';
      ctx.beginPath();
      ctx.arc(0, s * 0.15, s, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c98d3e';
      rr(ctx, -s, s * 0.15, s * 2, s * 0.35, s * 0.15);
      ctx.fill();
      ctx.fillStyle = '#fff2cf';
      ctx.beginPath();
      ctx.arc(-s * 0.4, -s * 0.35, s * 0.09, 0, Math.PI * 2);
      ctx.arc(s * 0.3, -s * 0.5, s * 0.09, 0, Math.PI * 2);
      ctx.arc(s * 0.05, -s * 0.15, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'patty': {
      ctx.fillStyle = state === 'panggang' ? '#6e4525' : '#b06a5a';
      rr(ctx, -s, -s * 0.45, s * 2, s * 0.9, s * 0.4);
      ctx.fill();
      ctx.fillStyle = state === 'panggang' ? '#8a5a33' : '#c98a7a';
      ctx.beginPath();
      ctx.arc(-s * 0.4, -s * 0.1, s * 0.14, 0, Math.PI * 2);
      ctx.arc(s * 0.35, s * 0.1, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'selada': {
      ctx.fillStyle = '#69c24a';
      if (state === 'potong') {
        for (const [dx, dy, r] of [[-0.4, -0.2, 0.32], [0.35, -0.25, 0.3], [0, 0.35, 0.34]]) {
          ctx.beginPath();
          ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3f8f2a';
        ctx.lineWidth = s * 0.12;
        ctx.beginPath();
        ctx.moveTo(-s * 0.7, 0);
        ctx.quadraticCurveTo(0, -s * 0.55, s * 0.7, 0);
        ctx.stroke();
      }
      break;
    }
    case 'tomat': {
      ctx.fillStyle = '#e5484d';
      if (state === 'potong') {
        ctx.beginPath();
        ctx.arc(-s * 0.25, 0, s * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.4, s * 0.1, s * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff8a8a';
        ctx.beginPath();
        ctx.arc(-s * 0.25, -s * 0.1, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, s * 0.1, s * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3f8f2a';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.75, s * 0.3, s * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff8a8a';
        ctx.beginPath();
        ctx.arc(-s * 0.3, -s * 0.2, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'keju': {
      ctx.fillStyle = '#f5c542';
      ctx.beginPath();
      ctx.moveTo(-s, s * 0.6);
      ctx.lineTo(s, s * 0.6);
      ctx.lineTo(0, -s * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c99a1e';
      ctx.beginPath();
      ctx.arc(-s * 0.2, s * 0.25, s * 0.14, 0, Math.PI * 2);
      ctx.arc(s * 0.3, s * 0.05, s * 0.11, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'pasta': {
      ctx.strokeStyle = state === 'rebus' ? '#e8c96a' : '#d9b45c';
      ctx.lineWidth = s * 0.28;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(0, i * s * 0.45, s * 0.55, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
      break;
    }
    case 'saus': {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(0, s * 0.1, s * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -s * 0.45, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e5735f';
      ctx.beginPath();
      ctx.arc(-s * 0.25, -s * 0.1, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// A plate with its contents stacked, drawn at (x, y) with diameter `size`.
export function drawPlate(ctx, contents, x, y, size) {
  const r = size / 2;
  ctx.fillStyle = '#e9edf0';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b9c4cc';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#cdd6db';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.72, r * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();
  const n = contents.length;
  contents.forEach((item, i) => {
    const ox = n <= 1 ? 0 : (i - (n - 1) / 2) * (size * 0.22);
    const oy = -r * 0.12 - (i % 2) * 4;
    drawFood(ctx, item.kind, item.state, x + ox, y + oy, size * 0.42);
  });
}

// --- Kitchen -----------------------------------------------------------------
function drawStationBase(ctx, rect, label, highlight) {
  ctx.fillStyle = COLORS.counter;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  rr(ctx, rect.x + 4, rect.y + 4, rect.w - 8, 26, 7);
  ctx.fill();
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 4;
    rr(ctx, rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6, 12);
    ctx.stroke();
  }
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 12, 13, '#fff3d6');
}

function drawProgressRing(ctx, x, y, r, frac, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac));
  ctx.stroke();
}

function drawSlots(ctx, slots, centers, size) {
  slots.forEach((slot, i) => {
    const c = centers[i];
    if (!slot.item) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c.x, c.y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }
    drawFood(ctx, slot.item.kind, slot.item.state, c.x, c.y, size);
    if (!slot.done) {
      drawProgressRing(ctx, c.x, c.y, size / 2 + 7, slot.progress, '#ffd76a');
    } else if (slot.burnt) {
      text(ctx, 'GOSONG!', c.x, c.y - size / 2 - 12, 13, '#ff6b6b');
    } else {
      const bx = c.x + size / 2 - 4;
      const by = c.y - size / 2 + 4;
      ctx.fillStyle = '#58b368';
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx - 4.5, by);
      ctx.lineTo(bx - 1, by + 3.5);
      ctx.lineTo(bx + 5, by - 3.5);
      ctx.stroke();
    }
  });
}

function drawKitchen(ctx, world) {
  const { stations, nearStationId } = world;
  // Floor: warm checker tiles.
  const tile = 64;
  for (let ty = 0; ty < Math.ceil(VIEW.height / tile); ty += 1) {
    for (let tx = 0; tx < Math.ceil(VIEW.width / tile); tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(tx * tile, HUD.height + ty * tile, tile, tile);
    }
  }
  // Top wall strip under the HUD.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, HUD.height, VIEW.width, 10);

  // Ingredient bins.
  for (const bin of LAYOUT.bins) {
    const ing = INGREDIENTS[bin.kind];
    const hl = nearStationId === `bin:${bin.kind}`;
    ctx.fillStyle = COLORS.steel;
    rr(ctx, bin.x, bin.y, LAYOUT.binSize, LAYOUT.binSize, 10);
    ctx.fill();
    if (hl) {
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 4;
      rr(ctx, bin.x - 3, bin.y - 3, LAYOUT.binSize + 6, LAYOUT.binSize + 6, 12);
      ctx.stroke();
    }
    drawFood(ctx, bin.kind, 'mentah', bin.x + LAYOUT.binSize / 2, bin.y + 34, 44);
    text(ctx, ing.name, bin.x + LAYOUT.binSize / 2, bin.y + LAYOUT.binSize - 12, 13, COLORS.ink);
  }
  text(ctx, 'Bahan', 70, 128, 14, '#fff3d6', 'center', 800);

  // Chopping board.
  const b = LAYOUT.board;
  drawStationBase(ctx, b, b.label, nearStationId === 'board');
  ctx.fillStyle = COLORS.board;
  rr(ctx, b.x + 14, b.y + 38, b.w - 28, 44, 8);
  ctx.fill();
  drawSlots(ctx, stations.board.slots,
    [{ x: b.x + 60, y: b.y + 60 }, { x: b.x + b.w - 60, y: b.y + 60 }], 40);

  // Grill.
  const g = LAYOUT.grill;
  drawStationBase(ctx, g, g.label, nearStationId === 'grill');
  ctx.fillStyle = '#3a3a3a';
  rr(ctx, g.x + 14, g.y + 38, g.w - 28, 44, 8);
  ctx.fill();
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(g.x + 14 + (i * (g.w - 28)) / 5, g.y + 38);
    ctx.lineTo(g.x + 14 + (i * (g.w - 28)) / 5, g.y + 82);
    ctx.stroke();
  }
  drawSlots(ctx, stations.grill.slots,
    [{ x: g.x + 60, y: g.y + 60 }, { x: g.x + g.w - 60, y: g.y + 60 }], 40);

  // Pot.
  const p = LAYOUT.pot;
  drawStationBase(ctx, p, p.label, nearStationId === 'pot');
  ctx.fillStyle = '#5a646c';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + 62, 62, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7d99a8';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + 58, 52, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  drawSlots(ctx, stations.pot.slots, [{ x: p.x + p.w / 2, y: p.y + 58 }], 40);

  // Plating counter.
  const pl = LAYOUT.plating;
  drawStationBase(ctx, pl, pl.label, nearStationId === 'plating');
  drawPlate(ctx, stations.plate.contents, pl.x + pl.w / 2, pl.y + 62, 92);

  // Serve window.
  const w = LAYOUT.window;
  drawStationBase(ctx, w, w.label, nearStationId === 'window');
  ctx.fillStyle = '#2b1d12';
  rr(ctx, w.x + 14, w.y + 38, w.w - 28, 84, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(w.x + w.w / 2, w.y + 80, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(w.x + w.w / 2, w.y + 80, 16, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineTo(w.x + w.w / 2, w.y + 80);
  ctx.fill();
  text(ctx, 'ANTAR DI SINI', w.x + w.w / 2, w.y + 56, 12, '#fff3d6');
  if (world.lastServe) {
    text(ctx, world.lastServe, w.x + w.w / 2, w.y + 108, 15, '#8dff9e');
  }

  // Trash.
  const t = LAYOUT.trash;
  drawStationBase(ctx, t, t.label, nearStationId === 'trash');
  ctx.fillStyle = '#4a4f55';
  rr(ctx, t.x + 26, t.y + 38, t.w - 52, 56, 8);
  ctx.fill();
  ctx.fillStyle = '#33383d';
  rr(ctx, t.x + 20, t.y + 32, t.w - 40, 12, 6);
  ctx.fill();
}

// --- Chef --------------------------------------------------------------------
function drawChef(ctx, chef) {
  const { x, y } = chef;
  const bob = chef.moving ? Math.sin(performance.now() / 90) * 2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 22, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: shirt + apron.
  ctx.fillStyle = COLORS.chefShirt;
  rr(ctx, x - 20, y - 8 + bob, 40, 34, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.chefApron;
  rr(ctx, x - 14, y + 2 + bob, 28, 24, 8);
  ctx.fill();
  // Head + hat.
  ctx.fillStyle = COLORS.chefSkin;
  ctx.beginPath();
  ctx.arc(x, y - 22 + bob, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.chefHat;
  ctx.beginPath();
  ctx.arc(x - 9, y - 32 + bob, 9, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 32 + bob, 9, 0, Math.PI * 2);
  ctx.arc(x, y - 36 + bob, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 14, y - 34 + bob, 28, 6);
  // Eyes look toward movement.
  ctx.fillStyle = '#222';
  const ex = chef.dirX * 3;
  const ey = chef.dirY * 2;
  ctx.beginPath();
  ctx.arc(x - 5 + ex, y - 22 + bob + ey, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 5 + ex, y - 22 + bob + ey, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Carried item floats above the head.
  if (chef.carry) {
    const cy = y - 62 + bob;
    if (chef.carry.type === 'plate') {
      drawPlate(ctx, chef.carry.contents, x, cy, 64);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(x, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      drawFood(ctx, chef.carry.item.kind, chef.carry.item.state, x, cy, 36);
    }
  }
}

// --- Particles & floating text ----------------------------------------------
function drawParticles(ctx, particles) {
  for (const pt of particles) {
    const a = Math.max(0, pt.life / pt.maxLife);
    ctx.globalAlpha = a * 0.8;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * (0.5 + a * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx, floaters) {
  for (const f of floaters) {
    const a = Math.max(0, f.life / f.maxLife);
    ctx.globalAlpha = a;
    text(ctx, f.text, f.x, f.y, 22, f.color, 'center', 800);
    ctx.globalAlpha = 1;
  }
}

// --- HUD: order board, timer, coins ------------------------------------------
function drawTicket(ctx, order, x, y, w, h) {
  const frac = Math.max(0, order.patience / order.patienceMax);
  ctx.fillStyle = COLORS.ticket;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = frac < 0.3 ? COLORS.bad : COLORS.ticketEdge;
  ctx.lineWidth = frac < 0.3 ? 3 : 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  text(ctx, order.recipe.name, x + 10, y + 14, 14, COLORS.ink, 'left', 800);
  text(ctx, `+${order.recipe.reward}`, x + w - 10, y + 14, 14, '#8a6d1d', 'right', 800);
  order.recipe.needs.forEach((need, i) => {
    drawFood(ctx, need.kind, need.state, x + 22 + i * 38, y + 42, 28);
  });
  // Patience bar.
  ctx.fillStyle = '#e0cfa5';
  rr(ctx, x + 10, y + h - 14, w - 20, 8, 4);
  ctx.fill();
  ctx.fillStyle = frac < 0.3 ? COLORS.bad : frac < 0.6 ? COLORS.warn : COLORS.good;
  rr(ctx, x + 10, y + h - 14, (w - 20) * frac, 8, 4);
  ctx.fill();
}

function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, VIEW.width, HUD.height);
  ctx.fillStyle = COLORS.hudEdge;
  ctx.fillRect(0, HUD.height - 4, VIEW.width, 4);
  // Order tickets.
  const ticketW = 200;
  const ticketH = 80;
  world.board.open.forEach((order, i) => {
    drawTicket(ctx, order, 12 + i * (ticketW + 10), 8, ticketW, ticketH);
  });
  if (world.board.open.length === 0) {
    text(ctx, 'Belum ada pesanan…', 110, 48, 15, '#cbb693');
  }
  // Shift timer (right side).
  const tx = VIEW.width - 300;
  const timeLeft = Math.max(0, world.timeLeft);
  const mm = Math.floor(timeLeft / 60);
  const ss = Math.floor(timeLeft % 60).toString().padStart(2, '0');
  const urgent = timeLeft <= 30;
  text(ctx, `${mm}:${ss}`, tx + 60, 30, 34, urgent ? '#ff6b6b' : '#fff3d6', 'center', 800);
  text(ctx, world.rush ? 'RUSH! Pesanan makin cepat' : 'SHIFT BERJALAN', tx + 60, 62, 12, urgent ? '#ff9a9a' : '#cbb693');
  // Coins + combo.
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(tx + 128, 28, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c99a1e';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'K', tx + 128, 29, 15, '#8a6d1d', 'center', 900);
  text(ctx, `${world.coins}`, tx + 200, 28, 26, '#ffd76a', 'center', 800);
  if (world.combo >= 2) {
    text(ctx, `COMBO x${world.combo}`, tx + 200, 60, 15, '#8dff9e', 'center', 800);
  } else {
    text(ctx, `Disajikan: ${world.board.served}`, tx + 200, 60, 13, '#cbb693', 'center', 800);
  }
  // Shift progress bar.
  const frac = 1 - timeLeft / world.shiftSeconds;
  ctx.fillStyle = '#4a2f1c';
  rr(ctx, 12, HUD.height - 12, VIEW.width - 24, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  rr(ctx, 12, HUD.height - 12, (VIEW.width - 24) * frac, 6, 3);
  ctx.fill();
}

// --- Screens -------------------------------------------------------------------
export function drawWorld(ctx, world) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);
  }
  drawKitchen(ctx, world);
  drawChef(ctx, world.chef);
  drawParticles(ctx, world.particles);
  drawFloaters(ctx, world.floaters);
  ctx.restore();
  drawHud(ctx, world);
  // Context hint at the bottom.
  const near = world.nearStationId;
  if (world.screen === SCREEN_PLAY && near) {
    const label = near.startsWith('bin:') ? `Ambil ${INGREDIENTS[near.slice(4)].name} [E]`
      : near === 'board' ? 'Talenan: taruh bahan untuk dipotong [E]'
      : near === 'grill' ? 'Panggangan: taruh patty untuk dipanggang [E]'
      : near === 'pot' ? 'Panci: taruh pasta untuk direbus [E]'
      : near === 'plating' ? 'Meja Plating: susun / ambil piring [E]'
      : near === 'window' ? 'Jendela Saji: antar piring pesanan [E]'
      : 'Sampah: buang yang dibawa [E]';
    ctx.fillStyle = 'rgba(43,29,18,0.85)';
    rr(ctx, VIEW.width / 2 - 220, VIEW.height - 34, 440, 26, 13);
    ctx.fill();
    text(ctx, label, VIEW.width / 2, VIEW.height - 21, 14, '#fff3d6');
  }
}

export function drawTitle(ctx, world) {
  drawWorld(ctx, world);
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'DAPUR KILAT', VIEW.width / 2, 190, 84, '#ffd76a', 'center', 900);
  text(ctx, 'Masak cepat, sajikan tepat — sebelum pelanggan kabur!', VIEW.width / 2, 260, 24, '#fff3d6');
  const lines = [
    'WASD / panah — jalan   •   E / Spasi — ambil, taruh, sajikan',
    'Klik lantai — jalan ke sana   •   Klik stasiun — jalan & berinteraksi',
    'Ambil bahan → potong / panggang / rebus → susun di piring → antar ke Jendela Saji',
    'Jangan biarkan masakan gosong. Pesanan yang kehabisan waktu akan pergi!',
  ];
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, 330 + i * 32, 18, '#e8d9b8'));
  text(ctx, 'Tekan ENTER atau klik untuk mulai', VIEW.width / 2, 500, 22, '#8dff9e', 'center', 800);
  text(ctx, 'Shift 3 menit  •  4 resep  •  Combo menaikkan bayaran', VIEW.width / 2, 544, 16, '#cbb693');
}

export function drawOver(ctx, world) {
  drawWorld(ctx, world);
  ctx.fillStyle = 'rgba(20,12,6,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'SHIFT SELESAI!', VIEW.width / 2, 170, 64, '#ffd76a', 'center', 900);
  const stars = world.stars;
  text(ctx, '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars)), VIEW.width / 2, 250, 52, '#ffd76a');
  const rows = [
    [`Koin didapat`, `${world.coins}`],
    [`Pesanan disajikan`, `${world.board.served}`],
    [`Pesanan kabur`, `${world.board.expired}`],
    [`Combo terbaik`, `x${world.bestCombo}`],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, VIEW.width / 2 - 180, 320 + i * 40, 20, '#e8d9b8', 'left');
    text(ctx, value, VIEW.width / 2 + 180, 320 + i * 40, 20, '#fff3d6', 'right', 800);
  });
  text(ctx, 'Tekan ENTER untuk main lagi', VIEW.width / 2, 540, 22, '#8dff9e', 'center', 800);
}
