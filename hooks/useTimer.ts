"use client";

import { useEffect, useState } from "react";

export function useTimer(startedAt: number | null): number {
  const [seconds, setSeconds] = useState(() =>
    startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
  );

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return seconds;
}
