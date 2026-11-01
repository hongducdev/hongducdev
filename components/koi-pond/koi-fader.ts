import { clamp, smoothstep } from "./koi-math";

/** Eases a 0..1 visibility toward a target; the first reading snaps so nothing flashes on load. */
export class Fader {
  private value = -1;

  constructor(private seconds = 0.4) {}

  update(target: number, dt: number): number {
    if (this.value < 0) this.value = target;
    else this.value = clamp(this.value + clamp(target - this.value, -dt / this.seconds, dt / this.seconds), 0, 1);
    return smoothstep(0, 1, this.value);
  }

  snap(): void {
    this.value = -1;
  }
}
