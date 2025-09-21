import { useEffect, useRef } from "react";

export function useSpreadsheetSync(onUpdate: (sheet: Record<string, string>) => void) {
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channel.current = new BroadcastChannel("sheet-sync");
    channel.current.onmessage = (e: MessageEvent) => {
      onUpdate(e.data.sheet);
    };
    return () => {
      channel.current?.close();
      channel.current = null;
    };
  }, [onUpdate]);

  function broadcast(sheet: Record<string, string>) {
    if (channel.current) {
      channel.current.postMessage({ sheet });
    } else {
      console.error("BroadcastChannel closed");
    }
  }

  return { broadcast };
}
