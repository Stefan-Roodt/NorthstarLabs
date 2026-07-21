"use client";

import { useCallback, useEffect, useState } from "react";

export const LOW_BANDWIDTH_STORAGE_KEY = "northstarlabs:low-bandwidth";

type ConnectionNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

export function useLowBandwidthMode() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY);
    const browserRequestsDataSaving = Boolean((navigator as ConnectionNavigator).connection?.saveData);
    const timer = window.setTimeout(() => {
      setEnabled(saved === null ? browserRequestsDataSaving : saved === "1");
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const update = useCallback((next: boolean) => {
    window.localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, next ? "1" : "0");
    setEnabled(next);
  }, []);

  const toggle = useCallback(() => update(!enabled), [enabled, update]);

  return { enabled, ready, toggle, update };
}
