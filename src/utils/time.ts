/** Time helpers. Everything works in milliseconds. */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

/**
 * Local calendar day key, e.g. "2026-07-22". Used to bucket totals per day.
 * `dayStartHour` lets a "day" begin at a custom hour (e.g. 4 = a day runs
 * 4am→4am) instead of midnight — anything before that hour still counts as
 * the previous calendar day.
 */
export function dayKey(date: Date = new Date(), dayStartHour = 0): string {
  const shifted =
    dayStartHour > 0 ? new Date(date.getTime() - dayStartHour * HOUR) : date;
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const d = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Stopwatch face: HH:MM:SS (hours dropped below 1h → MM:SS). */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / SECOND));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Human duration for totals: "4h 23m", "23m", "45s". */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / SECOND));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** Compact duration for dense chips: "4h23", "23m". */
export function formatDurationCompact(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / SECOND));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h${pad(m)}`;
  return `${m}m`;
}

/** Split ms into clock parts for animated digit rendering. */
export function clockParts(ms: number): { h: number; m: number; s: number; showHours: boolean } {
  const totalSec = Math.max(0, Math.floor(ms / SECOND));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, showHours: h > 0 };
}
