import { useState, useEffect } from 'react';

// The current time, refreshed every minute and whenever the tab becomes visible again
// (browsers throttle timers in background tabs, so a tab left open overnight would
// otherwise show yesterday until the next tick).
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, intervalMs);
    const onVisible = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);

  return now;
}
