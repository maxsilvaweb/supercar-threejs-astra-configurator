import { Move, Pointer } from "lucide-react";
import { useEffect, useState } from "react";
import type { CarDefinition } from "../../lib/schema";
import { useConfig } from "../../lib/store";
import { cn } from "@/lib/utils";

export function canEnterCabin(car: CarDefinition) {
  return Boolean(car.doors?.length || car.cabin);
}

const DRAG_THRESHOLD_PX = 4;

export function CabinExitButton({
  car,
  visible,
  hint = false,
  label = "Exit",
}: {
  car: CarDefinition;
  visible: boolean;
  hint?: boolean;
  label?: string;
}) {
  const exitCabin = useConfig((state) => state.setCameraPreset);
  const [dragging, setDragging] = useState(false);
  const showHint = hint || visible;

  useEffect(() => {
    if (!showHint) {
      setDragging(false);
      return;
    }

    let active = false;
    let startX = 0;
    let startY = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (target instanceof Element && target.closest("button, a")) return;
      active = true;
      startX = event.clientX;
      startY = event.clientY;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!active) return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) < DRAG_THRESHOLD_PX) return;
      setDragging(true);
    };

    const endDrag = () => {
      active = false;
      setDragging(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [showHint]);

  if (!showHint || !canEnterCabin(car)) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <div
        className={cn(
          "cabin-gesture-anchor absolute top-6 left-1/2 -translate-x-1/2 md:top-8",
        )}
      >
        <div className="relative">
          {visible ? (
            <button
              type="button"
              className="cabin-exit-btn surface-carbon-rosso pointer-events-auto"
              onClick={() => exitCabin("threeQuarter")}
            >
              {label}
            </button>
          ) : (
            <div className="cabin-exit-btn invisible" aria-hidden />
          )}
          <span className="cabin-gesture-spot" aria-hidden>
            <Pointer className="scene-orb-pointer" strokeWidth={2.2} />
          </span>
        </div>
        <p
          className={cn("cabin-look-hint", dragging && "is-dragging")}
          aria-hidden={dragging || undefined}
          aria-live="polite"
        >
          <Move aria-hidden strokeWidth={2.2} />
          Drag to look around
        </p>
      </div>
    </div>
  );
}
