// File: src/utils/safe-timer.ts
const timers = new Set<string>();

export function startTimer(abel: string) {
  if (!timers.has(abel)) {
    console.time(abel);
    timers.add(abel);
  }
}

export function endTimer(abel: string) {
  if (timers.has(abel)) {
    console.timeEnd(abel);
    timers.delete(abel);
  }
}
