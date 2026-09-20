import { useCallback, useEffect, useRef, useState } from "react";

export type IframeStatus = "loading" | "loaded" | "error";

/**
 * Tracks a third-party iframe's load state so callers can show a skeleton while
 * it loads and a fallback if it never does. Cross-origin embeds rarely fire a
 * reliable `onError`, so a timeout is the real guard: if `onLoad` hasn't fired
 * within `timeoutMs`, we surface the error/fallback state. `reload` bumps a key
 * so the caller can remount the iframe to retry.
 */
export function useIframeStatus(timeoutMs = 10000) {
  const [status, setStatus] = useState<IframeStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setStatus("loading");
    timer.current = setTimeout(() => {
      setStatus((s) => (s === "loaded" ? s : "error"));
    }, timeoutMs);
    return () => clearTimeout(timer.current);
  }, [timeoutMs, reloadKey]);

  const onLoad = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("loaded");
  }, []);

  const onError = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("error");
  }, []);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { status, reloadKey, onLoad, onError, reload };
}
