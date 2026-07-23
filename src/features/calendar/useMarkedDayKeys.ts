import { useMemo } from 'react';

import { useTimerStore } from '../../stores/timerStore';

/** Set of day keys that have at least one logged activity — for calendar dots. */
export function useMarkedDayKeys(): ReadonlySet<string> {
  const history = useTimerStore((s) => s.history);
  return useMemo(() => {
    const set = new Set<string>();
    for (const [key, day] of Object.entries(history)) {
      if (day.entries.some((e) => e.ms > 0)) set.add(key);
    }
    return set;
  }, [history]);
}
