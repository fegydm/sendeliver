// File: front/src/lib/utils.ts
// Last change: Removed clsx and replaced with a simpler conditional class merge

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}
