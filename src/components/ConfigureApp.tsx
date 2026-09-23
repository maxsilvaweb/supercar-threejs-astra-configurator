import { Component, useEffect, useState, type ReactNode } from "react";
import { getCar } from "../cars";
import { preloadGarageAmbience, startGarageAmbience, stopGarageAmbience } from "../lib/garage-ambience";
import { useConfig } from "../lib/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MenuClickSounds } from "./overlay/MenuClickSounds";
import { SoundPanel } from "./overlay/SoundPanel";
import { Tuner } from "./overlay/Tuner";
import { HotspotLayer } from "./overlay/HotspotLayer";
import { Preloader } from "./overlay/Preloader";
import { StudioCanvas } from "./studio/StudioCanvas";

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

export function ConfigureApp({ slug }: { slug: string }) {
  const car = getCar(slug);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const buildId = new URLSearchParams(window.location.search).get("build");
    if (buildId && useConfig.getState().loadBuild(buildId)) return;
    useConfig.getState().loadCar(slug);
  }, [slug]);

  useEffect(() => {
    preloadGarageAmbience();
    return () => stopGarageAmbience();
  }, []);

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
            <StudioCanvas car={car} />
            <Tuner car={car} revealed={revealed} />
            <SoundPanel visible={revealed} />
          </HotspotLayer>
          <Preloader
            label="Configure"
            slug={car.slug}
            name={car.name}
            subtitle={car.tagline}
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
