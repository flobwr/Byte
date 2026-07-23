import { useMemo } from 'react';

import { rankCategories, scoreBand, scoreForTotals } from '../stats/score';
import { useDayLog } from '../../hooks/useDayLog';
import { sumTotals } from '../../stores/timerStore';

export function useDayDetail(key: string) {
  const { entries, note, totals } = useDayLog(key);

  return useMemo(() => {
    const total = sumTotals(totals);
    const score = scoreForTotals(totals);
    return {
      key,
      entries,
      note,
      totals,
      total,
      score,
      scoreLabel: scoreBand(score),
      byCategory: rankCategories(totals),
    };
  }, [key, entries, note, totals]);
}
