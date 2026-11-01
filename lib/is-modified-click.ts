import type { MouseEvent } from "react";

export function isModifiedClick(e: MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}
