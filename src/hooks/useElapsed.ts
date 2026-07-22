import { useEffect, useRef, useState } from 'react';

import { elapsedFrom, useTimerStore } from '../stores/timerStore';

/**
 * Live elapsed time of the current stopwatch segment, in ms.
 * Recomputes from the absolute anchor once per second while running — cheap,
 * drift-free, and safe across app backgrounding.
 *
 * @param tickMs how often to refresh the value (default 1000ms)
 */
export function useElapsed(tickMs = 1000): number {
  const status = useTimerStore((s) => s.status);
  const sessionAnchor = useTimerStore((s) => s.sessionAnchor);
  const pausedElapsed = useTimerStore((s) => s.pausedElapsed);

  const compute = () =>
    elapsedFrom(
      { status, sessionAnchor, pausedElapsed } as Parameters<typeof elapsedFrom>[0],
      Date.now(),
    );

  const [elapsed, setElapsed] = useState(compute);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsed(compute());
    if (status !== 'running') return;

    raf.current = setInterval(() => setElapsed(compute()), tickMs);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionAnchor, pausedElapsed, tickMs]);

  return elapsed;
}
