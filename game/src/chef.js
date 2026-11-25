// The chef: one cook, two hands, and a route through the kitchen.
// Movement is keyboard (WASD / arrows) or click-to-walk; clicking a
// station walks there and interacts on arrival. The chef carries at most
// one thing: a single ingredient, or a plate with its contents.

import { CHEF, VIEW, HUD, clamp } from './config.js';

const INTERACT_DIST = 95;

export function createChef() {
  const chef = {
    x: VIEW.width / 2,
    y: 480,
    dirX: 0,
    dirY: 1, // facing down at rest
    moving: false,
    carry: null, // null | {type:'item', item} | {type:'plate', contents}
    walkTarget: null,
    interactOnArrival: null,
  };

  chef.reset = () => {
    chef.x = VIEW.width / 2;
    chef.y = 480;
    chef.dirX = 0;
    chef.dirY = 1;
    chef.moving = false;
    chef.carry = null;
    chef.walkTarget = null;
    chef.interactOnArrival = null;
  };

  // Step the chef one frame. Returns the station id the chef is close
  // enough to interact with right now, or null.
  chef.step = (dt, input, stations) => {
    chef.moving = false;
    const keys = input.moveVector();
    if (keys) {
      chef.x += keys.x * CHEF.speed * dt;
      chef.y += keys.y * CHEF.speed * dt;
      chef.dirX = keys.x;
      chef.dirY = keys.y;
      chef.moving = true;
      chef.walkTarget = null;
      chef.interactOnArrival = null;
    } else if (input.moveTarget) {
      const tx = input.moveTarget.x;
      const ty = input.moveTarget.y;
      const dx = tx - chef.x;
      const dy = ty - chef.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {
        input.moveTarget = null;
        if (input.interactTarget) {
          const stationId = input.interactTarget;
          input.interactTarget = null;
          return stationId;
        }
      } else {
        chef.x += (dx / dist) * CHEF.speed * dt;
        chef.y += (dy / dist) * CHEF.speed * dt;
        chef.dirX = dx / dist;
        chef.dirY = dy / dist;
        chef.moving = true;
      }
    }
    // Keep the chef on the kitchen floor (below the HUD, inside the walls).
    chef.x = clamp(chef.x, 30, VIEW.width - 30);
    chef.y = clamp(chef.y, HUD.height + 30, VIEW.height - 30);
    return null;
  };

  // The station nearest the chef, if one is within reach.
  chef.nearStation = (stations) => stations.nearest(chef.x, chef.y, INTERACT_DIST);

  // Aim the chef at a station: walk to its approach point, then interact.
  chef.goToStation = (input, stations, stationId) => {
    const point = stations.approachPoint(stationId);
    if (!point) return;
    input.moveTarget = point;
    input.interactTarget = stationId;
  };

  return chef;
}
