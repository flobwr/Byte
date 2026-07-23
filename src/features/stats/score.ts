import {
  type Category,
  type CategoryId,
  type CategoryType,
  resolveCategory,
} from '../../stores/categoriesStore';

/**
 * How much each category type counts toward the day score — progress helps
 * it, waste hurts it, essential is neutral.
 *
 * Kept dependency-free from the timer/sync layers on purpose: both
 * `useStats` (UI) and the Supabase sync layer (`services/sync/days.ts`) need
 * to compute the same score, and the sync layer sits underneath
 * `timerStore` — importing this from a module that itself depends on
 * `timerStore` would create an import cycle.
 */
const TYPE_WEIGHT: Record<CategoryType, number> = { progress: 1, essential: 0.5, waste: -0.5 };

export type CategoryTotal = { category: Category; ms: number };

export function scoreBand(score: number): string {
  if (score === 0) return '—';
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Bonne journée';
  if (score >= 25) return 'Correct';
  return 'À équilibrer';
}

/** 0..100 — weighted by each logged activity's type (progress/essential/waste). */
export function scoreForTotals(totals: Partial<Record<CategoryId, number>>): number {
  const total = Object.values(totals).reduce<number>((a, v) => a + (v ?? 0), 0);
  if (total <= 0) return 0;
  let weighted = 0;
  for (const [id, ms] of Object.entries(totals)) {
    if (!ms) continue;
    weighted += TYPE_WEIGHT[resolveCategory(id).type] * ms;
  }
  return Math.max(0, Math.min(100, Math.round((weighted / total) * 100)));
}

export function rankCategories(source: Partial<Record<CategoryId, number>>): CategoryTotal[] {
  return Object.entries(source)
    .filter(([, ms]) => (ms ?? 0) > 0)
    .map(([id, ms]) => ({ category: resolveCategory(id), ms: ms ?? 0 }))
    .sort((a, b) => b.ms - a.ms);
}
