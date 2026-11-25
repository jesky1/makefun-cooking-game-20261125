// The kitchen stations: ingredient bins, chopping board, grill, pot,
// plating counter, serve window and trash. Each station owns its slots
// and progress; the chef only asks it to interact. Prep work runs on its
// own clock — chop and cook finish by themselves, and food left too long
// after it is done burns.

import { INGREDIENTS, LAYOUT, PLATE_MAX, PREP } from './config.js';

function emptySlot() {
  return { item: null, progress: 0, done: false, burnt: false, overTime: 0 };
}

export function createStations() {
  const stations = {
    board: { slots: [emptySlot(), emptySlot()] },
    grill: { slots: [emptySlot(), emptySlot()] },
    pot: { slots: [emptySlot()] },
    plate: { contents: [] }, // the plate resting on the plating counter
  };

  // --- geometry ------------------------------------------------------------
  function rectOf(id) {
    if (id.startsWith('bin:')) {
      const kind = id.slice(4);
      const bin = LAYOUT.bins.find((b) => b.kind === kind);
      return { x: bin.x, y: bin.y, w: LAYOUT.binSize, h: LAYOUT.binSize };
    }
    if (id === 'board') return LAYOUT.board;
    if (id === 'grill') return LAYOUT.grill;
    if (id === 'pot') return LAYOUT.pot;
    if (id === 'plating') return LAYOUT.plating;
    if (id === 'window') return LAYOUT.window;
    if (id === 'trash') return LAYOUT.trash;
    return null;
  }

  function distToRect(x, y, rect) {
    const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    return Math.hypot(x - cx, y - cy);
  }

  stations.nearest = (x, y, maxDist) => {
    let best = null;
    let bestDist = maxDist;
    const ids = LAYOUT.bins.map((b) => `bin:${b.kind}`);
    ids.push('board', 'grill', 'pot', 'plating', 'window', 'trash');
    for (const id of ids) {
      const rect = rectOf(id);
      const d = distToRect(x, y, rect);
      if (d < bestDist) { bestDist = d; best = { id, dist: d, rect }; }
    }
    return best;
  };

  stations.approachPoint = (id) => {
    const rect = rectOf(id);
    if (!rect) return null;
    // Stand just outside the station's lower edge (or right edge for bins).
    if (id.startsWith('bin:')) return { x: rect.x + rect.w + 30, y: rect.y + rect.h / 2 };
    return { x: rect.x + rect.w / 2, y: rect.y + rect.h + 34 };
  };

  // --- prep progress ---------------------------------------------------------
  // Advance chopping / cooking. Returns events: {type:'done'|'burnt', station, slot}
  stations.step = (dt) => {
    const events = [];
    const advance = (group, seconds, burnAfter, cookedState) => {
      for (let i = 0; i < stations[group].slots.length; i += 1) {
        const slot = stations[group].slots[i];
        if (!slot.item || slot.burnt) continue;
        if (!slot.done) {
          slot.progress += dt / seconds;
          if (slot.progress >= 1) {
            slot.progress = 1;
            slot.done = true;
            slot.item.state = cookedState;
            events.push({ type: 'done', station: group, slot: i });
          }
        } else {
          slot.overTime += dt;
          if (slot.overTime >= burnAfter) {
            slot.burnt = true;
            slot.item.state = 'gosong';
            events.push({ type: 'burnt', station: group, slot: i });
          }
        }
      }
    };
    advance('board', PREP.chopSeconds, Infinity, 'potong');
    advance('grill', PREP.grillSeconds, PREP.grillBurnAfter, 'panggang');
    advance('pot', PREP.potSeconds, PREP.potBurnAfter, 'rebus');
    return events;
  };

  // --- interaction -----------------------------------------------------------
  // carry is the chef's hands: null, {type:'item', item} or {type:'plate', contents}.
  // Returns { ok, action, detail } — main.js turns actions into sound/particles.
  stations.interact = (id, carry) => {
    // Bins: take a raw ingredient into empty hands.
    if (id.startsWith('bin:')) {
      if (carry) return { ok: false, action: 'hands-full' };
      const kind = id.slice(4);
      return { ok: true, action: 'take', carry: { type: 'item', item: { kind, state: 'mentah' } } };
    }

    const placeOn = (group, wantPrep, cookedState) => {
      const slots = stations[group].slots;
      // Take a finished item into empty hands first.
      if (!carry) {
        for (let i = 0; i < slots.length; i += 1) {
          const slot = slots[i];
          if (slot.item && (slot.done || slot.burnt)) {
            const item = slot.item;
            slots[i] = emptySlot();
            return { ok: true, action: 'take-cooked', carry: { type: 'item', item } };
          }
        }
        return { ok: false, action: 'not-ready' };
      }
      // Place a matching raw item onto a free slot.
      if (carry.type !== 'item') return { ok: false, action: 'needs-item' };
      const ing = INGREDIENTS[carry.item.kind];
      if (ing.prep !== wantPrep || carry.item.state !== 'mentah') {
        return { ok: false, action: 'wrong-station' };
      }
      for (let i = 0; i < slots.length; i += 1) {
        if (!slots[i].item) {
          slots[i].item = carry.item;
          return { ok: true, action: 'place', carry: null };
        }
      }
      return { ok: false, action: 'station-full' };
    };

    if (id === 'board') return placeOn('board', 'chop', 'potong');
    if (id === 'grill') return placeOn('grill', 'grill', 'panggang');
    if (id === 'pot') return placeOn('pot', 'pot', 'rebus');

    if (id === 'plating') {
      // Add an ingredient to the plate, or pick the plate up.
      if (carry && carry.type === 'item') {
        if (carry.item.state === 'gosong') return { ok: false, action: 'burnt' };
        if (stations.plate.contents.length >= PLATE_MAX) return { ok: false, action: 'plate-full' };
        stations.plate.contents.push(carry.item);
        return { ok: true, action: 'plate-add', carry: null };
      }
      if (carry && carry.type === 'plate') return { ok: false, action: 'hands-full' };
      const contents = stations.plate.contents;
      stations.plate.contents = [];
      return { ok: true, action: 'plate-pickup', carry: { type: 'plate', contents } };
    }

    if (id === 'window') {
      if (!carry || carry.type !== 'plate') return { ok: false, action: 'needs-plate' };
      return { ok: true, action: 'serve-attempt', carry };
    }

    if (id === 'trash') {
      if (!carry) return { ok: false, action: 'hands-empty' };
      if (carry.type === 'plate') {
        return { ok: true, action: 'trash-plate', carry: { type: 'plate', contents: [] } };
      }
      return { ok: true, action: 'trash', carry: null };
    }

    return { ok: false, action: 'unknown' };
  };

  stations.reset = () => {
    stations.board.slots = [emptySlot(), emptySlot()];
    stations.grill.slots = [emptySlot(), emptySlot()];
    stations.pot.slots = [emptySlot()];
    stations.plate.contents = [];
  };

  return stations;
}
