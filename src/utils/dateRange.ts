import { dayKey } from './time';

/** Parse a "YYYY-MM-DD" key into a local Date anchored at noon (DST-safe). */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d;
}

/** The 7 day-keys of the current calendar week, Monday → Sunday. */
export function currentWeekKeys(date: Date = new Date()): string[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return dayKey(d);
  });
}

/** Short weekday initials, Monday-first (French). */
export const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function isSameMonth(key: string, ref: Date = new Date()): boolean {
  const d = parseDayKey(key);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

/** "22 juil. 2026" style short date. */
const SHORT_MONTHS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

export function formatShortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
