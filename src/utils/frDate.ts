/** Lightweight French date formatting — no reliance on Intl locale data (Hermes-safe). */

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** e.g. "Mercredi 22 juillet". */
export function formatLongDate(date: Date = new Date()): string {
  return `${cap(WEEKDAYS[date.getDay()]!)} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** Time-of-day greeting. */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bel après-midi';
  return 'Bonsoir';
}
