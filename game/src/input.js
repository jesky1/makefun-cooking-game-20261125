// Keyboard + mouse input for DAPUR KILAT.
// WASD / arrows move the chef, E or Space interacts, Enter starts,
// M toggles sound. Clicking the floor sets a walk target; clicking a
// station walks there and interacts on arrival. All coordinates are
// converted into the game's logical 1280x800 space by main.js.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // edge-triggered keys, consumed once per step
  const input = {
    keys,
    pressed,
    moveTarget: null,      // {x, y} in logical space, or null
    interactTarget: null,  // station id to interact with on arrival, or null
    mouse: { x: 0, y: 0 },
    // logical-space transform, set by main.js after each resize
    toLogical: (clientX, clientY) => ({ x: clientX, y: clientY }),
  };

  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    KeyE: 'interact', Space: 'interact',
    Enter: 'start', KeyM: 'mute',
  };

  window.addEventListener('keydown', (event) => {
    const action = KEYMAP[event.code];
    if (!action) return;
    if (action === 'interact' || action === 'start') event.preventDefault();
    if (!event.repeat) pressed.add(action);
    keys.add(action);
  });
  window.addEventListener('keyup', (event) => {
    const action = KEYMAP[event.code];
    if (action) keys.delete(action);
  });
  window.addEventListener('blur', () => {
    keys.clear();
    input.moveTarget = null;
    input.interactTarget = null;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const point = input.toLogical(event.clientX, event.clientY);
    input.mouse = point;
    input.moveTarget = point;
    input.interactTarget = null;
  });

  // A held key or a click target both count as "want to move".
  input.moveVector = () => {
    let x = 0;
    let y = 0;
    if (keys.has('left')) x -= 1;
    if (keys.has('right')) x += 1;
    if (keys.has('up')) y -= 1;
    if (keys.has('down')) y += 1;
    if (x !== 0 || y !== 0) {
      const len = Math.hypot(x, y);
      return { x: x / len, y: y / len, fromKeys: true };
    }
    return null;
  };

  // Consume one edge-triggered press; returns true once per physical press.
  input.consume = (action) => {
    if (!pressed.has(action)) return false;
    pressed.delete(action);
    return true;
  };

  // Clear per-step edge presses that nobody consumed (keeps stale Enter
  // presses from leaking into the next screen).
  input.endStep = () => pressed.clear();

  return input;
}
