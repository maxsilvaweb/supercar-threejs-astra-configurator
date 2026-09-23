import { Html } from "@react-three/drei";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHotspotPortal } from "../overlay/HotspotLayer";

export function SceneOrb({
  label,
  className,
  children,
  onClick,
  onPointerEnter,
  onPointerLeave,
  zIndexRange = [80, 40],
}: {
  label: string;
  className?: string;
  children?: ReactNode;
  onClick: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  zIndexRange?: [number, number];
}) {
  const portal = useHotspotPortal();
  return (
    <Html
      center
      sprite
      occlude={false}
      portal={portal}
      pointerEvents="none"
      zIndexRange={zIndexRange}
      style={{ overflow: "visible" }}
    >
      <button
        type="button"
        aria-label={label}
        className={cn("scene-orb surface-carbon-lime", className)}
        style={{ pointerEvents: "auto" }}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerEnter={(event) => {
          event.stopPropagation();
          onPointerEnter?.();
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onPointerLeave?.();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        {children}
      </button>
    </Html>
  );
}
