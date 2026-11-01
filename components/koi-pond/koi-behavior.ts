import { angleDiff, clamp } from "./koi-math";
import { KOI_NODES, type Box, type Koi, type World } from "./koi-world";

const STARTLE_SPEED = 1100;
const FEED_CALM = 2;
const RUSH_RANGE = 650;
const MAX_BEND = 0.16;

const push = { x: 0, y: 0 };

/** Sum of pushes away from every box within `margin` of (x, y), each scaled 0..1 by closeness. */
function repel(boxes: readonly Box[], x: number, y: number, margin: number): typeof push {
  push.x = 0;
  push.y = 0;
  for (const box of boxes) {
    let ox = x - clamp(x, box.left, box.right);
    let oy = y - clamp(y, box.top, box.bottom);
    let dist = Math.hypot(ox, oy);
    if (dist > margin) continue;
    if (dist < 1e-3) {
      const edges = [box.left - x, x - box.right, box.top - y, y - box.bottom];
      const nearest = edges.indexOf(Math.max(...edges));
      ox = nearest === 0 ? -1 : nearest === 1 ? 1 : 0;
      oy = nearest === 2 ? -1 : nearest === 3 ? 1 : 0;
      dist = 0;
    }
    const len = Math.hypot(ox, oy) || 1;
    push.x += (ox / len) * (1 - dist / margin);
    push.y += (oy / len) * (1 - dist / margin);
  }
  return push;
}

export function stepKoi(world: World, koi: Koi, dt: number): void {
  const { width: W, height: H, pointer, time } = world;
  const L = koi.length;
  const nodes = koi.nodes;
  const hx = nodes[0];
  const hy = nodes[1];

  let dx = Math.cos(koi.heading);
  let dy = Math.sin(koi.heading);

  koi.wander = clamp(koi.wander + (world.random() - 0.5) * dt * 2.4, -0.9, 0.9);
  dx += Math.cos(koi.heading + koi.wander) * 0.6;
  dy += Math.sin(koi.heading + koi.wander) * 0.6;

  const food = world.pickFood(koi, hx, hy, Math.max(L * 1.6 + 220, koi.rush > 0 ? RUSH_RANGE : 0));

  // A fast swipe close by spooks a koi; one already after food, or right after a throw, ignores it.
  const pointerDist = Math.hypot(pointer.x - hx, pointer.y - hy);
  const feeding = time - world.lastFeed < FEED_CALM;
  if (!food && !feeding && pointer.active && pointer.speed > STARTLE_SPEED && pointerDist < L * 0.9) {
    koi.startle = 1;
    koi.fleeX = pointer.x;
    koi.fleeY = pointer.y;
  }
  koi.startle = Math.max(0, koi.startle - dt * 0.6);
  const fleeing = koi.startle > 0.3 && !food;

  let chasing = false;
  let curious = false;
  let closing = 0;
  if (fleeing) {
    const ox = hx - koi.fleeX;
    const oy = hy - koi.fleeY;
    const dist = Math.hypot(ox, oy) || 1;
    dx += (ox / dist) * 4 * koi.startle;
    dy += (oy / dist) * 4 * koi.startle;
  } else if (food) {
    const tx = food.x - hx;
    const ty = food.y - hy;
    const dist = Math.hypot(tx, ty) || 1;
    dx += (tx / dist) * 3;
    dy += (ty / dist) * 3;
    chasing = true;
    closing = clamp(1 - dist / (L * 1.2), 0, 1);
  } else if (pointer.active) {
    const tx = pointer.x - hx;
    const ty = pointer.y - hy;
    const dist = Math.hypot(tx, ty) || 1;
    const range = 300;
    if (dist < range) {
      // Swim up to the cursor, then circle beneath it instead of parking.
      const weight = koi.curiosity * (1 - dist / range) * 2.2;
      const near = clamp(dist / (L * 0.6), 0, 1);
      dx += ((tx / dist) * near - (ty / dist) * (1 - near)) * weight;
      dy += ((ty / dist) * near + (tx / dist) * (1 - near)) * weight;
      curious = true;
    }
  }

  for (const other of world.koi) {
    if (other === koi) continue;
    const ohx = other.nodes[0];
    const ohy = other.nodes[1];
    if (Math.abs(ohx - hx) > L * 2 || Math.abs(ohy - hy) > L * 2) continue;
    for (let n = 0; n < KOI_NODES; n += 3) {
      const ox = hx - other.nodes[n * 2];
      const oy = hy - other.nodes[n * 2 + 1];
      const dist = Math.hypot(ox, oy);
      const range = (L + other.length) * (food ? 0.12 : 0.28);
      if (dist < range && dist > 1e-3) {
        const weight = (1 - dist / range) * 2.4;
        dx += (ox / dist) * weight;
        dy += (oy / dist) * weight;
      }
    }
    if (!chasing && Math.hypot(ohx - hx, ohy - hy) < L * 1.6) {
      dx += Math.cos(other.heading) * 0.18;
      dy += Math.sin(other.heading) * 0.18;
    }
  }

  repel(world.avoid, hx, hy, L * 0.4);
  const avoidWeight = chasing || curious ? 0.5 : 1.8;
  dx += push.x * avoidWeight;
  dy += push.y * avoidWeight;

  // The body may slip off-screen briefly, but the koi always turns back.
  const over = Math.max(-hx, hx - W, -hy, hy - H);
  if (over > -L * 0.25) {
    const weight = clamp((over + L * 0.25) / (L * 0.5), 0, 1) * 3.5;
    const toX = W / 2 - hx;
    const toY = H / 2 - hy;
    const dist = Math.hypot(toX, toY) || 1;
    dx += (toX / dist) * weight;
    dy += (toY / dist) * weight;
  }

  const desired = Math.atan2(dy, dx);
  // The turning circle grows with body length.
  const agility =
    (1 + koi.rush * 0.6) *
    Math.min(fleeing ? 3 : chasing ? 1.9 + closing : curious ? 1.2 : 0.7, (koi.speed / L) * 4);
  const maxTurn = agility * dt;
  const turned = clamp(angleDiff(koi.heading, desired), -maxTurn, maxTurn);
  koi.heading += turned;
  koi.turn += (turned / dt - koi.turn) * Math.min(1, dt * 3);

  if (time > koi.nextBurst && time > koi.burstUntil) {
    koi.burstUntil = time + world.rand(0.7, 1.6);
    koi.nextBurst = koi.burstUntil + world.rand(1.2, 4);
  }
  const bursting = fleeing || chasing || time < koi.burstUntil;
  koi.beat += ((bursting ? 1 : 0) - koi.beat) * Math.min(1, dt * 3);
  if (koi.beat > 0.6 && koi.depth > 0.65 && time > koi.nextWake) {
    const tail = (KOI_NODES - 3) * 2;
    world.ripples.push({ x: nodes[tail], y: nodes[tail + 1], born: time, strength: 0.25 + 0.2 * koi.depth });
    koi.nextWake = time + world.rand(0.8, 1.6) / koi.beat;
  }
  koi.rush = Math.max(0, koi.rush - dt * 0.7);

  const cruise = 12 + L * 0.05;
  const target =
    (1 + koi.rush * 0.8) *
    (fleeing
      ? cruise * 3.2
      : chasing
        ? cruise * (1.9 + closing)
        : bursting
          ? cruise * (curious ? 1.6 : 1.35)
          : cruise * 0.45);
  koi.speed += (target - koi.speed) * Math.min(1, dt * (bursting ? 1.6 + koi.rush * 3 : 0.35));
  koi.phase += dt * (0.6 + koi.beat * (2.2 + koi.speed / 11));
  koi.finPhase += dt * 2.4;
  koi.gulp += ((chasing && closing > 0.55 ? 1 : 0) - koi.gulp) * Math.min(1, dt * 6);

  if (time > koi.nextDive) {
    koi.depthTarget = world.rand(0.5, koi.depthMax);
    koi.nextDive = time + world.rand(8, 20);
  }
  koi.depth += ((chasing ? 1 : koi.depthTarget) - koi.depth) * Math.min(1, dt * (chasing ? 0.8 : 0.15));

  nodes[0] += Math.cos(koi.heading) * koi.speed * dt;
  nodes[1] += Math.sin(koi.heading) * koi.speed * dt;

  const segment = L / (KOI_NODES - 1);
  let prevAngle = koi.heading + Math.PI;
  for (let n = 1; n < KOI_NODES; n++) {
    const px = nodes[(n - 1) * 2];
    const py = nodes[(n - 1) * 2 + 1];
    let angle = Math.atan2(nodes[n * 2 + 1] - py, nodes[n * 2] - px);
    angle = prevAngle + clamp(angleDiff(prevAngle, angle), -MAX_BEND, MAX_BEND);
    nodes[n * 2] = px + Math.cos(angle) * segment;
    nodes[n * 2 + 1] = py + Math.sin(angle) * segment;
    prevAngle = angle;
  }

  if (world.eatAt(nodes[0], nodes[1], L * 0.08 + 6) > 0) {
    koi.nextSurface = time + world.rand(6, 16);
  } else if (time > koi.nextSurface) {
    world.ripples.push({ x: nodes[0], y: nodes[1], born: time, strength: 0.3 });
    koi.nextSurface = time + world.rand(8, 20);
  }
}
