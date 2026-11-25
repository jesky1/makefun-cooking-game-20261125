// DAPUR KILAT — all the numbers, names and recipes in one place.
// Nothing here is read from the network; the whole game is drawn from these values.

export const VIEW = { width: 1280, height: 800 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 180;
export const RUSH_AT = 45; // last seconds of the shift: orders arrive faster

// --- Ingredients -----------------------------------------------------------
// prep: what a raw ingredient needs before it can go on a plate.
//   none  -> ready as taken from the bin
//   chop  -> needs the chopping board (state "potong")
//   grill -> needs the grill (state "panggang", burns if left too long)
//   pot   -> needs the pot (state "rebus", burns if left too long)
export const INGREDIENTS = {
  roti:   { id: 'roti',   name: 'Roti',       prep: 'none',  color: '#e8b25c', dark: '#b97f2e' },
  patty:  { id: 'patty',  name: 'Patty',      prep: 'grill', color: '#8a5a33', dark: '#5f3a1d' },
  selada: { id: 'selada', name: 'Selada',     prep: 'chop',  color: '#69c24a', dark: '#3f8f2a' },
  tomat:  { id: 'tomat',  name: 'Tomat',      prep: 'chop',  color: '#e5484d', dark: '#a92c30' },
  keju:   { id: 'keju',   name: 'Keju',       prep: 'none',  color: '#f5c542', dark: '#c99a1e' },
  pasta:  { id: 'pasta',  name: 'Pasta',      prep: 'pot',   color: '#f0d089', dark: '#c9a24e' },
  saus:   { id: 'saus',   name: 'Saus',       prep: 'none',  color: '#c0392b', dark: '#8e2418' },
};

// A carried / stationed item: { kind, state } where state is one of
// 'mentah' (raw), 'potong' (chopped), 'panggang' (grilled), 'rebus' (boiled),
// 'gosong' (burnt — trash only).
export const STATE_LABEL = {
  mentah: 'mentah', potong: 'potong', panggang: 'panggang', rebus: 'rebus', gosong: 'GOSONG',
};

// --- Recipes ---------------------------------------------------------------
// Each recipe is the exact multiset a plate must hold to match an order.
// 'state' is the state the ingredient must be in on the plate.
export const RECIPES = [
  {
    id: 'burger', name: 'Burger Kilat', reward: 45,
    needs: [
      { kind: 'roti', state: 'mentah' },
      { kind: 'patty', state: 'panggang' },
      { kind: 'selada', state: 'potong' },
      { kind: 'tomat', state: 'potong' },
    ],
  },
  {
    id: 'salad', name: 'Salad Segar', reward: 30,
    needs: [
      { kind: 'selada', state: 'potong' },
      { kind: 'tomat', state: 'potong' },
      { kind: 'keju', state: 'mentah' },
    ],
  },
  {
    id: 'pasta', name: 'Pasta Saus', reward: 35,
    needs: [
      { kind: 'pasta', state: 'rebus' },
      { kind: 'saus', state: 'mentah' },
      { kind: 'keju', state: 'mentah' },
    ],
  },
  {
    id: 'sandwich', name: 'Sandwich Kilat', reward: 30,
    needs: [
      { kind: 'roti', state: 'mentah' },
      { kind: 'keju', state: 'mentah' },
      { kind: 'tomat', state: 'potong' },
    ],
  },
];

// --- Timing ----------------------------------------------------------------
export const ORDER = {
  maxOpen: 4,
  spawnEvery: 13,       // seconds between new orders
  spawnEveryRush: 9,
  patience: 70,          // seconds before an order walks out
  patienceRush: 55,
  firstOrders: 2,
};
export const PREP = {
  chopSeconds: 3,
  grillSeconds: 6,
  grillBurnAfter: 5,     // grace seconds after done before it burns
  potSeconds: 7,
  potBurnAfter: 6,
};
export const CHEF = { speed: 250, radius: 24 };
export const PLATE_MAX = 5;

// --- Kitchen layout (logical 1280x800) --------------------------------------
export const HUD = { height: 96 };
export const LAYOUT = {
  // ingredient bins, left wall: one column, so standing beside a bin
  // is never ambiguous about which bin the chef means.
  bins: [
    { kind: 'roti',   x: 28,  y: 140 },
    { kind: 'patty',  x: 28,  y: 232 },
    { kind: 'selada', x: 28,  y: 324 },
    { kind: 'tomat',  x: 28,  y: 416 },
    { kind: 'keju',   x: 28,  y: 508 },
    { kind: 'pasta',  x: 28,  y: 600 },
    { kind: 'saus',   x: 28,  y: 692 },
  ],
  binSize: 84,
  // chopping board (2 slots), grill (2 slots), pot (1 slot) along the top
  board: { x: 300, y: 140, w: 220, h: 110, slots: 2, label: 'Talenan' },
  grill: { x: 560, y: 140, w: 220, h: 110, slots: 2, label: 'Panggangan' },
  pot:   { x: 820, y: 140, w: 180, h: 110, slots: 1, label: 'Panci' },
  // plating counter, bottom centre
  plating: { x: 300, y: 640, w: 400, h: 120, label: 'Meja Plating' },
  // serve window, right wall
  window: { x: 1060, y: 140, w: 196, h: 190, label: 'Jendela Saji' },
  // trash, bottom right
  trash: { x: 1060, y: 640, w: 120, h: 120, label: 'Sampah' },
};

// --- Palette -----------------------------------------------------------------
export const COLORS = {
  floorA: '#c98f5f', floorB: '#bd8252',
  wall: '#7a4a2b', wallTop: '#8d5a35',
  counter: '#a06a3f', counterTop: '#d9a05b', counterEdge: '#7c4f2c',
  steel: '#b9c4cc', steelDark: '#8b98a1',
  board: '#e0b184',
  hud: '#2b1d12', hudEdge: '#4a2f1c',
  ticket: '#fff6dd', ticketEdge: '#d8b96a',
  ink: '#2b1d12', cream: '#fff3d6',
  good: '#58b368', warn: '#f5a623', bad: '#e5484d',
  chefSkin: '#f2c79b', chefHat: '#ffffff', chefShirt: '#e5484d', chefApron: '#f5f0e6',
};

// Small helpers shared by the modules.
export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
export function itemKey(item) {
  return `${item.kind}:${item.state}`;
}
export function recipeKey(recipe) {
  return recipe.needs.map((n) => `${n.kind}:${n.state}`).sort().join('|');
}
export function plateKey(contents) {
  return contents.map(itemKey).sort().join('|');
}
