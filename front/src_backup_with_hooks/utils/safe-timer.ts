// File: src/utils/safe-timer.ts
const timers = new Set<string>();

export function startTimer(label: string) {
  if (!timers.has(label)) {
    console.time(label);
    timers.add(label);
  }
}

export function endTimer(label: string) {
  if (timers.has(label)) {
    console.timeEnd(label);
    timers.delete(label);
  }
}
