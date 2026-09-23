import { createContext, useContext, useState, type ReactNode, type RefObject } from "react";

const HotspotPortalContext = createContext<RefObject<HTMLElement | null>>({ current: null });

export function useHotspotPortal() {
  return useContext(HotspotPortalContext);
}

export function HotspotLayer({ children }: { children: ReactNode }) {
  const [portal] = useState(() => ({ current: null as HTMLElement | null }));
  const [ready, setReady] = useState(false);

  return (
    <HotspotPortalContext.Provider value={portal}>
      {children}
      <div
        ref={(node) => {
          portal.current = node;
          if (node && !ready) setReady(true);
        }}
        className="pointer-events-none absolute inset-0 z-[1]"
      />
    </HotspotPortalContext.Provider>
  );
}
