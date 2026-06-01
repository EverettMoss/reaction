import { useState, useEffect, useRef } from 'react';

export function useLocalTimer(startedAt: number | null, stopped: boolean): number {
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (startedAt === null) {
      setElapsedMs(0);
      return;
    }

    if (stopped) return;

    function tick() {
      setElapsedMs(Date.now() - startedAt!);
      if (!stopped) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startedAt, stopped]);

  return elapsedMs;
}
