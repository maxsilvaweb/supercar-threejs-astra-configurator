import { Component, useEffect, useState, type ReactNode } from "react";
import { getCar } from "../cars";
import { INTERFACE_SOUNDS, STUDIO_SOUNDS } from "../lib/constants";
import { preloadGarageAmbience, startGarageAmbience, stopGarageAmbience } from "../lib/garage-ambience";
import { configureModelUrls, prefetchCar } from "../lib/models";
import { preloadSounds, preloadSoundsLater } from "../lib/play-one-shot-sound";
import { useConfig } from "../lib/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MenuClickSounds } from "./overlay/MenuClickSounds";
import { canEnterCabin } from "./overlay/CabinExitButton";
import { CabinStartButton } from "./overlay/CabinStartButton";
import { SoundPanel } from "./overlay/SoundPanel";
import { Tuner } from "./overlay/Tuner";
import { HotspotLayer } from "./overlay/HotspotLayer";
import { Preloader } from "./overlay/Preloader";
import { ConfigGarageCanvas } from "./garage/ConfigGarageCanvas";
import { MobileDialog } from "./overlay/MobileDialog";
import { useDesktopGate } from "../lib/desktop";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message || String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-dvh place-items-center text-center">
          <div className="space-y-3">
            <p>{this.state.error}</p>
            <a className="underline" href="/">Back to garage</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const readyCars = new Set<string>();

function slugFromLocation() {
  const match = window.location.pathname.match(/\/configure\/([^/]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

function showCar(slug: string) {
  const next = getCar(slug);
  if (!next || next.comingSoon) return false;
  const buildId = new URLSearchParams(window.location.search).get("build");
  prefetchCar(next);
  document.title = `${next.name} · silvaweb`;
  if (buildId && useConfig.getState().loadBuild(buildId)) return true;
  useConfig.getState().loadCar(slug);
  return true;
}

export function ConfigureApp({ slug: initialSlug }: { slug: string }) {
  const desktop = useDesktopGate();
  const [slug, setSlug] = useState(initialSlug);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const car = getCar(slug);
  const [revealed, setRevealed] = useState(false);
  const interior = useConfig((state) => state.cameraPreset === "interior");
  const cabinSide = useConfig((state) => state.cabinSide);

  useEffect(() => {
    const fromUrl = slugFromLocation();
    if (fromUrl && showCar(fromUrl)) setSlug(fromUrl);
    else if (initialSlug) showCar(initialSlug);

    const onPop = () => {
      const nextSlug = slugFromLocation();
      if (!nextSlug || !showCar(nextSlug)) return;
      setSlug(nextSlug);
      setRevealed(false);
      setPendingSlug(readyCars.has(nextSlug) ? null : nextSlug);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [initialSlug]);

  useEffect(() => {
    preloadSounds(INTERFACE_SOUNDS);
    preloadGarageAmbience();
    return () => stopGarageAmbience();
  }, []);

  useEffect(() => {
    preloadSoundsLater([...STUDIO_SOUNDS, car?.doorSound, car?.ignition?.sound]);
  }, [car]);

  const selectCar = (nextSlug: string) => {
    if (nextSlug === slug) return;
    const next = getCar(nextSlug);
    if (!next || next.comingSoon) return;
    prefetchCar(next);
    useConfig.getState().loadCar(nextSlug);
    document.title = `${next.name} · silvaweb`;
    history.pushState({ configureSlug: nextSlug }, "", `/configure/${nextSlug}`);
    setRevealed(false);
    setSlug(nextSlug);
    setPendingSlug(readyCars.has(nextSlug) ? null : nextSlug);
  };

  const carReady = (ready: { slug: string }) => {
    readyCars.add(ready.slug);
    setPendingSlug((current) => (current === ready.slug ? null : current));
  };

  if (!desktop) {
    return (
      <TooltipProvider>
        <MobileDialog />
      </TooltipProvider>
    );
  }

  if (!car || car.comingSoon) {
    return (
      <div className="grid min-h-dvh place-items-center text-center">
        <div className="space-y-3">
          <p>This model is not configured yet.</p>
          <a className="underline" href="/">
            Back to garage
          </a>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <MenuClickSounds />
        <main className="relative h-dvh overflow-hidden">
          <HotspotLayer>
            <ConfigGarageCanvas car={car} onCarReady={carReady} />
            <Tuner car={car} revealed={revealed} pendingSlug={pendingSlug} onSelectCar={selectCar} />
            <SoundPanel visible={revealed} ambience>
              <CabinStartButton
                visible={revealed && interior && cabinSide === "right" && canEnterCabin(car)}
              />
            </SoundPanel>
          </HotspotLayer>
          <Preloader
            key={car.slug}
            label="Configure"
            slug={car.slug}
            brand={car.brand}
            name={car.name}
            year={car.year}
            subtitle={car.tagline}
            history={car.history}
            models={configureModelUrls(car.model)}
            onDone={() => {
              setRevealed(true);
              startGarageAmbience();
            }}
          />
        </main>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
