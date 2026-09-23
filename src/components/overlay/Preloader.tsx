import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { carPreviewUrl } from "../../lib/constants";
import { preloadModels } from "../../lib/models";
import { cn } from "@/lib/utils";

function describeLoad(item: string, progress: number) {
  const name = item.toLowerCase();

  if (/\.(png|jpe?g|webp|ktx2?|hdr|exr)(\?|$)/.test(name) || name.includes("texture") || name.includes("hdri") || name.includes("envmap")) {
    return "Loading textures";
  }
  if (name.includes("garage") || name.includes("studio")) {
    return "Loading garage";
  }
  if (/\.(glb|gltf|obj|fbx|bin)(\?|$)/.test(name) || name.includes("/models/")) {
    return "Loading models";
  }
  if (name.includes("draco")) return "Decoding models";
  if (progress < 12) return "Preparing studio";
  if (progress < 55) return "Loading models";
  if (progress < 88) return "Loading textures";
  if (progress < 100) return "Preparing studio";
  return "Ready";
}

export function Preloader({
  label = "Studio",
  name,
  subtitle,
  slug,
  models,
  onDone,
}: {
  label?: string;
  name?: string;
  subtitle?: string;
  slug?: string;
  models?: string[];
  onDone?: () => void;
}) {
  const { active, progress, item } = useProgress();
  const [visible, setVisible] = useState(true);
  const [covered, setCovered] = useState(false);
  const [copyIn, setCopyIn] = useState(false);
  const [peeling, setPeeling] = useState(false);
  const [shown, setShown] = useState(2);
  const [status, setStatus] = useState("Preparing studio");
  const started = useRef(false);
  const modelKey = models?.join("|") ?? "";

  useEffect(() => {
    if (models?.length) preloadModels(models);
  }, [modelKey, models]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCovered(true));
    const copy = window.setTimeout(() => setCopyIn(true), 920);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(copy);
    };
  }, []);

  useEffect(() => {
    if (active || progress > 0) started.current = true;
    setStatus(describeLoad(item, progress));
  }, [active, item, progress]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setShown((current) => {
        const target = Math.min(100, Math.max(progress, active ? 3 : current));
        const next = current + (target - current) * 0.14;
        return Math.abs(next - target) < 0.2 ? target : next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, progress]);

  const loaded = !active && (progress >= 99 || !started.current);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!copyIn || !loaded || peeling) return;
    const peel = window.setTimeout(() => setPeeling(true), 700);
    return () => window.clearTimeout(peel);
  }, [copyIn, loaded, peeling]);

  useEffect(() => {
    if (!peeling) return;
    const gone = window.setTimeout(() => setVisible(false), 1050);
    return () => window.clearTimeout(gone);
  }, [peeling]);

  useEffect(() => {
    if (visible) return;
    onDoneRef.current?.();
  }, [visible]);

  if (!visible) return null;

  const percent = Math.round(shown);

  return (
    <div
      className={cn(
        "preloader-mask absolute inset-0 z-50 bg-[#111111]",
        covered && !peeling && "is-covered",
        peeling && "is-peeling",
      )}
      role="status"
      aria-live="polite"
      aria-busy={!peeling}
    >
      <div className="grid h-full place-items-center">
        <div
          className={cn(
            "preloader-copy w-[min(22rem,calc(100vw-2.5rem))] space-y-5",
            copyIn && !peeling && "is-visible",
            peeling && "is-leaving",
          )}
        >
          {slug ? (
            <img
              src={carPreviewUrl(slug)}
              alt=""
              className="aspect-[960/589] w-full rounded-md object-cover"
              draggable={false}
            />
          ) : null}
          <div className="space-y-1.5">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs font-medium tracking-[0.16em] text-white uppercase">
              <span>{label}</span>
              {name ? (
                <span className="text-sm tracking-normal text-white normal-case">
                  {name}
                  {subtitle ? ` ${subtitle}` : ""}
                </span>
              ) : null}
            </p>
            <p className="text-lg font-medium tracking-tight text-white">{status}</p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#cfff00] transition-[width] duration-200 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs tabular-nums">{percent}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
