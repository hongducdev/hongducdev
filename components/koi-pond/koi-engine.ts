import { KoiRenderer } from "./koi-renderer";
import { World, type Box } from "./koi-world";

export interface PondStats {
  koi: number;
  pellets: number;
}

const STEP = 1 / 60;
const MAX_STEPS = 4;
const COMPACT_FRAME_MS = 1000 / 30;
const MAX_DPR = 2;
const MAX_DPR_COMPACT = 1.5;
// Elements that own their own click, or opt out with data-pond-ignore, never drop food.
const INTERACTIVE = "a, button, input, textarea, select, label, [role='button'], [data-pond-ignore]";
// Page content marked with this attribute is steered around and dims the koi beneath it.
const AVOID_TARGETS = "[data-pond-avoid]";
const MEASURE_EVERY_FRAMES = 30;
// Content boxes closer than this merge so koi are not squeezed into the slot between them.
const MERGE_GAP_PX = 160;

function mergeNearby(boxes: readonly Box[]): Box[] {
  const merged: Box[] = [];
  for (const box of [...boxes].sort((p, q) => p.top - q.top)) {
    const near = merged.find(
      (m) =>
        box.top - m.bottom < MERGE_GAP_PX && box.left - m.right < MERGE_GAP_PX && m.left - box.right < MERGE_GAP_PX,
    );
    if (!near) {
      merged.push({ ...box });
      continue;
    }
    near.left = Math.min(near.left, box.left);
    near.right = Math.max(near.right, box.right);
    near.bottom = Math.max(near.bottom, box.bottom);
  }
  return merged;
}

export class PondEngine {
  private world = new World();
  private renderer: KoiRenderer;
  private raf = 0;
  private last = 0;
  private lastDraw = 0;
  private acc = 0;
  private frames = 0;
  private lastPointerTime = 0;
  private reported: PondStats = { koi: -1, pellets: -1 };
  private visible = true;
  private disposed = false;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private compact = window.matchMedia("(max-width: 767px), (pointer: coarse)");
  private resizeObserver = new ResizeObserver(() => this.resize());
  private intersectionObserver = new IntersectionObserver(([entry]) => {
    this.visible = entry.isIntersecting;
    this.schedule();
  });

  constructor(
    private canvas: HTMLCanvasElement,
    private onStats: (stats: PondStats) => void,
  ) {
    this.renderer = new KoiRenderer(canvas);
    this.resizeObserver.observe(canvas);
    this.intersectionObserver.observe(canvas);
    this.reducedMotion.addEventListener("change", this.schedule);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("click", this.onClick);
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("blur", this.onPointerLeave);
    document.addEventListener("visibilitychange", this.schedule);
    this.resize();
    this.schedule();
  }

  destroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.schedule);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("click", this.onClick);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
    document.removeEventListener("visibilitychange", this.schedule);
  }

  setTheme(isLight: boolean): void {
    this.renderer.setTheme(isLight);
    if (this.reducedMotion.matches) this.drawStill();
  }

  setFontFamily(family: string): void {
    this.renderer.setFontFamily(family);
    if (this.reducedMotion.matches) this.drawStill();
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this.compact.matches ? MAX_DPR_COMPACT : MAX_DPR);
    this.renderer.resize(rect.width, rect.height, dpr);
    this.world.resize(rect.width, rect.height);
    this.measureContent();
    this.report();
    if (this.reducedMotion.matches) this.drawStill();
  }

  private report(): void {
    const koi = this.world.koi.length;
    const pellets = this.world.pellets.length;
    if (koi === this.reported.koi && pellets === this.reported.pellets) return;
    this.reported = { koi, pellets };
    this.onStats(this.reported);
  }

  private schedule = (): void => {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || document.hidden) return;
    if (this.reducedMotion.matches) {
      this.drawStill();
      return;
    }
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  };

  private measureContent(): void {
    const origin = this.canvas.getBoundingClientRect();
    const measured = Array.from(document.querySelectorAll(AVOID_TARGETS), (el) => el.getBoundingClientRect())
      .filter((b) => b.width > 0 && b.height > 0)
      .map((b) => ({
        left: b.left - origin.left,
        top: b.top - origin.top,
        right: b.right - origin.left,
        bottom: b.bottom - origin.top,
      }));
    const boxes = mergeNearby(measured);
    this.renderer.setDimBoxes(boxes);
    this.world.avoid = boxes;
  }

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < MAX_STEPS) {
      this.world.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) this.acc = 0;
    if (++this.frames % MEASURE_EVERY_FRAMES === 0) this.measureContent();
    if (this.compact.matches && now - this.lastDraw < COMPACT_FRAME_MS - 2) return;
    this.lastDraw = now;
    this.renderer.render(this.world, dt);
    this.report();
  };

  /** Reduced motion: let the koi spread out, then hold a single frame. */
  private drawStill(): void {
    if (this.world.time < 4) {
      for (let i = 0; i < 240; i++) this.world.step(STEP);
    }
    this.measureContent();
    this.renderer.render(this.world, STEP);
    this.report();
  }

  private toLocal(e: MouseEvent): { x: number; y: number; inside: boolean } {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  }

  private onPointerMove = (e: PointerEvent): void => {
    const { x, y, inside } = this.toLocal(e);
    const pointer = this.world.pointer;
    const elapsed = Math.max(1, e.timeStamp - this.lastPointerTime) / 1000;
    const speed = Math.hypot(x - pointer.x, y - pointer.y) / elapsed;
    pointer.speed += (Math.min(speed, 5000) - pointer.speed) * 0.5;
    this.lastPointerTime = e.timeStamp;
    pointer.x = x;
    pointer.y = y;
    pointer.active = inside && e.pointerType !== "touch";
  };

  private onClick = (e: MouseEvent): void => {
    if (this.reducedMotion.matches) return;
    // composedPath keeps controls that re-render as they are clicked (the theme toggle) detectable.
    if (e.composedPath().some((node) => node instanceof Element && node.matches(INTERACTIVE))) return;
    if (window.getSelection()?.toString()) return;
    const { x, y, inside } = this.toLocal(e);
    if (!inside) return;
    this.world.feed(x, y);
    this.report();
  };

  private onPointerLeave = (): void => {
    this.world.pointer.active = false;
    this.world.pointer.speed = 0;
  };
}
