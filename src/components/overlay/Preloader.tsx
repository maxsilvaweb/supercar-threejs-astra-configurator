import { useProgress } from "@react-three/drei";
import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCar } from "../../cars";
import { carBackdropUrl, carPreviewUrl } from "../../lib/constants";
import { preloadModels } from "../../lib/models";
import type { Brand, CarHistory } from "../../lib/schema";
import { cn } from "@/lib/utils";
import { BrandMark, brandLabel } from "./BrandMark";

export interface PreloaderCar {
  slug: string;
  name: string;
  year: string;
  brand: Brand;
}

function describeLoad(item: string, progress: number) {
  const name = item.toLowerCase();

  if (/\.(png|jpe?g|webp|ktx2?|hdr|exr)(\?|$)/.test(name) || name.includes("texture") || name.includes("hdri") || name.includes("envmap")) {
    return "Loading textures and sounds";
  }
  if (name.includes("garage") || name.includes("studio")) {
    return "Loading garage and sounds";
  }
  if (/\.(glb|gltf|obj|fbx|bin)(\?|$)/.test(name) || name.includes("/models/")) {
    return "Loading models and sounds";
  }
  if (/\.(wav|mp3|ogg)(\?|$)/.test(name) || name.includes("/sounds/")) return "Loading sounds";
  if (name.includes("draco")) return "Decoding models";
  if (progress < 12) return "Preparing studio";
  if (progress < 55) return "Loading models and sounds";
  if (progress < 88) return "Loading textures and sounds";
  if (progress < 100) return "Preparing studio";
  return "Ready";
}

function formatElapsed(ms: number) {
  const seconds = Math.max(0, ms) / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function Preloader({
  label = "Studio",
  name,
  subtitle,
  slug,
  brand,
  history,
  roster,
  stamp,
  models,
  onDone,
}: {
  label?: string;
  name?: string;
  year?: string;
  subtitle?: string;
  slug?: string;
  brand?: Brand;
  history?: CarHistory;
  roster?: PreloaderCar[];
  stamp?: string;
  models?: string[];
  onDone?: () => void;
}) {
  const { active, progress, item } = useProgress();
  const [visible, setVisible] = useState(true);
  const [covered, setCovered] = useState(false);
  const [copyIn, setCopyIn] = useState(false);
  const [peeling, setPeeling] = useState(false);
  const [shown, setShown] = useState(2);
  const [backdrop, setBackdrop] = useState(true);
  const [backdropReady, setBackdropReady] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const backdropRef = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const carBackdrop = Boolean(slug && getCar(slug));
  const [status, setStatus] = useState("Preparing studio");
  const [elapsedMs, setElapsedMs] = useState(0);
  const started = useRef(false);
  const holdElapsed = useRef(false);
  const modelKey = models?.join("|") ?? "";

  useEffect(() => {
    if (models?.length) preloadModels(models);
  }, [modelKey, models]);

  useEffect(() => {
    const images = [backdropRef.current, previewRef.current];
    if (images.some((node) => node?.complete && node.naturalWidth > 0 && node.classList.contains("preloader-wash"))) {
      setBackdropReady(true);
    }
    if (images.some((node) => node?.complete && node.naturalWidth > 0 && node.classList.contains("preloader-shot"))) {
      setPreviewReady(true);
    }
  }, [slug]);

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

  const percent = Math.round(shown);
  const settled = !active && (progress >= 99 || !started.current);
  holdElapsed.current = settled && started.current;

  useEffect(() => {
    const origin = performance.now();
    const id = window.setInterval(() => {
      const next = performance.now() - origin;
      setElapsedMs(next);
      if (holdElapsed.current) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, []);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!copyIn || peeling) return;
    if (!settled && percent < 100) return;
    const peel = window.setTimeout(() => setPeeling(true), history || roster?.length ? 2800 : 700);
    return () => window.clearTimeout(peel);
  }, [copyIn, history, peeling, roster, settled, percent]);

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
      {carBackdrop && backdrop ? (
        <img
          ref={backdropRef}
          src={carBackdropUrl(slug)}
          alt=""
          className={cn("preloader-wash", backdropReady && "is-ready")}
          draggable={false}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) setBackdropReady(true);
          }}
          onError={() => setBackdrop(false)}
        />
      ) : null}
      {brand ? (
        <BrandMark
          brand={brand}
          className={cn(
            "preloader-mark h-auto",
            brand === "aston-martin" || brand === "mclaren"
              ? "top-8 left-8 w-[min(32rem,62vw)]"
              : "top-[-7rem] left-[-6rem] w-[min(46rem,78vw)]",
            copyIn && "is-visible",
          )}
        />
      ) : null}
      <div className="relative z-10 grid h-full place-items-center px-6">
        <div
          className={cn(
            "preloader-copy w-[min(58rem,calc(100vw-3rem))] space-y-5",
            (history || roster?.length) && "preloader-copy--dossier",
            copyIn && !peeling && "is-visible",
            peeling && "is-leaving",
          )}
        >
          <div className="space-y-5">
            {slug ? (
              <img
                ref={previewRef}
                src={carPreviewUrl(slug)}
                alt=""
                className={cn("preloader-shot aspect-[960/589] w-full rounded-md object-cover", previewReady && "is-ready")}
                draggable={false}
                onLoad={(event) => {
                  if (event.currentTarget.naturalWidth > 0) setPreviewReady(true);
                }}
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
                  className="bg-primary h-full rounded-full transition-[width] duration-200 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-muted-foreground text-xs tabular-nums">{percent}%</p>
                <p className="text-muted-foreground text-xs tabular-nums">{formatElapsed(elapsedMs)}</p>
              </div>
            </div>
          </div>
          {history ? (
            <aside className={cn("preloader-dossier", !roster?.length && "is-compact")} aria-label="Car history">
              <div className="preloader-dossier-top">
                <h2 className="preloader-dossier-title">{history.headline}</h2>
                <span className="preloader-dossier-stamp btn-chrome is-steady is-pill" aria-label={stamp ?? "Archive"}>
                  <Info aria-hidden />
                </span>
              </div>
              {history.kicker ? <p className="preloader-dossier-kicker">{history.kicker}</p> : null}
              <div className="sound-console-well">
                <p className="preloader-dossier-body">{history.body}</p>
                {roster?.length ? (
                  <ol className="preloader-dossier-list">
                    {roster.map((car) => (
                      <li key={car.slug} className="sound-console-row">
                        <span className="preloader-roster-name">
                          <BrandMark brand={car.brand} className="preloader-roster-mark" />
                          <span>
                            {brandLabel[car.brand]} {car.name}
                          </span>
                        </span>
                        <span className="preloader-roster-year">{car.year}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
                {history.facts?.length ? (
                  <dl className="preloader-dossier-list">
                    {history.facts.map((fact) => (
                      <div key={fact.label} className="sound-console-row">
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
