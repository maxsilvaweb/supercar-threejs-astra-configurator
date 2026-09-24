import { useEffect, useId, useState } from "react";
import { startEngineLoop, stopEngineLoop } from "../../lib/engine-loop";
import { cn } from "@/lib/utils";

const RING =
  "M256,0C114.84,0,0,114.844,0,256c0,141.16,114.84,256,256,256s256-114.84,256-256C512,114.844,397.16,0,256,0z M256,474.484c-120.473,0-218.484-98.007-218.484-218.484c0-120.473,98.011-218.484,218.484-218.484S474.484,135.527,474.484,256C474.484,376.477,376.473,474.484,256,474.484z";

const LAMP =
  "M287.418,121.859c0,3.438-2.785,6.223-6.222,6.223h-50.39c-3.438,0-6.222-2.786-6.222-6.223v-8.187c0-3.438,2.785-6.222,6.222-6.222h50.39c3.438,0,6.222,2.785,6.222,6.222V121.859z";

export function CabinStartButton({ visible }: { visible: boolean }) {
  const patternId = useId().replace(/:/g, "");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (visible) return;
    setRunning(false);
    stopEngineLoop();
  }, [visible]);

  useEffect(() => () => stopEngineLoop(), []);

  if (!visible) return null;

  const toggle = () => {
    setRunning((current) => {
      if (current) {
        stopEngineLoop();
        return false;
      }
      startEngineLoop();
      return true;
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <button
        type="button"
        className={cn("cabin-start pointer-events-auto", running && "is-running")}
        aria-pressed={running}
        aria-label={running ? "Stop engine" : "Start engine"}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={toggle}
      >
        <svg viewBox="0 0 512 512" aria-hidden>
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="72" height="72">
              <image href="/ui/carbon.png" width="72" height="72" />
              <rect width="72" height="72" fill={`url(#${patternId}-shade)`} />
            </pattern>
            <linearGradient id={`${patternId}-shade`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <circle cx="256" cy="256" r="224" fill={`url(#${patternId})`} />
          <path fill="#141416" fillRule="evenodd" d={RING} />
          <circle className="cabin-start-tint" cx="256" cy="256" r="218.5" />
          <path className="cabin-start-lamp" d={LAMP} />
        </svg>
        <span className="cabin-start-copy">
          <span className="cabin-start-label">{running ? "STOP" : "START"}</span>
          <span className="cabin-start-sub">Ignition</span>
        </span>
      </button>
    </div>
  );
}
