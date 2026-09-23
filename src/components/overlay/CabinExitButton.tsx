import { Pointer } from "lucide-react";
import type { CarDefinition } from "../../lib/schema";
import { useConfig } from "../../lib/store";
import { cn } from "@/lib/utils";

export function canEnterCabin(car: CarDefinition) {
  return Boolean(car.doors?.length || car.cabin);
}

export function CabinExitButton({
  car,
  visible,
  label = "Exit",
}: {
  car: CarDefinition;
  visible: boolean;
  label?: string;
}) {
  const exitCabin = useConfig((state) => state.setCameraPreset);

  if (!visible || !canEnterCabin(car)) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <div
        className={cn(
          "cabin-gesture-anchor pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2 md:top-8",
        )}
      >
        <button
          type="button"
          className="cabin-exit-btn surface-carbon-rosso"
          onClick={() => exitCabin("threeQuarter")}
        >
          {label}
        </button>
        <span className="cabin-gesture-spot" aria-hidden>
          <Pointer className="scene-orb-pointer" strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
}
