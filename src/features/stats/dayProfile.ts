import { type CategoryTotal } from './score';

export type DayProfile = { label: string; sentence: string };

function namesOf(byCategory: readonly CategoryTotal[]): string {
  const names = [byCategory[0]?.category.label, byCategory[1]?.category.label].filter(
    (n): n is string => Boolean(n),
  );
  return names.length === 2 ? `${names[0]} et ${names[1]}` : (names[0] ?? '');
}

const SENTENCE_BY_LABEL: Record<string, (names: string) => string> = {
  'Très productive': (n) =>
    n
      ? `Aujourd’hui a été une journée très productive, dominée par ${n}.`
      : `Aujourd’hui a été une journée très productive.`,
  Concentrée: (n) =>
    n
      ? `Tu as été concentré·e aujourd’hui, surtout sur ${n}.`
      : `Tu as été concentré·e aujourd’hui.`,
  Active: (n) => (n ? `Une journée active, portée par ${n}.` : `Une journée active.`),
  Apprentissage: (n) =>
    n
      ? `Une journée tournée vers l’apprentissage, avec ${n}.`
      : `Une journée tournée vers l’apprentissage.`,
  Calme: (n) => (n ? `Une journée calme, plutôt centrée sur ${n}.` : `Une journée calme.`),
  Loisirs: (n) => (n ? `Une journée détente, dominée par ${n}.` : `Une journée détente.`),
  Équilibrée: (n) =>
    n
      ? `Tu as bien équilibré progression et détente aujourd’hui, entre ${n}.`
      : `Tu as bien équilibré tes activités aujourd’hui.`,
};

/**
 * A short, human read on the day — a complement to the numeric score, built
 * from the mix of category types (and the top activities) rather than any
 * hardcoded category id, so it still makes sense once categories are
 * renamed or fully custom.
 */
export function computeDayProfile(
  byCategory: readonly CategoryTotal[],
  total: number,
): DayProfile | null {
  if (total <= 0 || byCategory.length === 0) return null;

  let progress = 0;
  let essential = 0;
  let waste = 0;
  for (const { category, ms } of byCategory) {
    if (category.type === 'progress') progress += ms;
    else if (category.type === 'waste') waste += ms;
    else essential += ms;
  }

  const pRatio = progress / total;
  const wRatio = waste / total;
  const eRatio = essential / total;
  const topMascot = byCategory[0]?.category.mascot;

  let label: string;
  if (pRatio >= 0.7) label = 'Très productive';
  else if ((topMascot === 'reading' || topMascot === 'writing') && pRatio >= 0.3)
    label = 'Apprentissage';
  else if (topMascot === 'sport' && pRatio >= 0.2) label = 'Active';
  else if (wRatio >= 0.55) label = 'Loisirs';
  else if (eRatio >= 0.55) label = 'Calme';
  else if (pRatio >= 0.4 && wRatio < 0.25) label = 'Concentrée';
  else label = 'Équilibrée';

  return { label, sentence: SENTENCE_BY_LABEL[label]!(namesOf(byCategory)) };
}
