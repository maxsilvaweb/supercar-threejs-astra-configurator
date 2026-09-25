import { ArrowRight, Ban, ChevronsLeft, ChevronsRight, Flag, PanelLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { listCars, listConfigurableCars } from "../../cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopGarageAmbience } from "../../lib/garage-ambience";
import { garageModelUrls, prefetchCar, prefetchConfigure } from "../../lib/models";
import { playOneShotSound, preloadSounds, preloadSoundsLater } from "../../lib/play-one-shot-sound";
import { INTERFACE_SOUNDS, STUDIO_GARAGE_ENTRY, STUDIO_GARAGE_ENTRY_VOLUME, STUDIO_INFO_STORAGE_KEY, STUDIO_SOUNDS } from "../../lib/constants";
import { isSideOverlay, watchOverlayOpen } from "../../lib/overlay-frame";
import { studioPanelClass, studioToggleClass } from "../../lib/studio-overlay";
import { cn } from "@/lib/utils";
import { WarehouseCanvas } from "../warehouse/WarehouseCanvas";
import { BrandMark } from "./BrandMark";
import { SpecHighlights } from "./CarSpec";
import { HotspotLayer } from "./HotspotLayer";
import { MenuClickSounds } from "./MenuClickSounds";
import { Preloader } from "./Preloader";
import { SoundPanel } from "./SoundPanel";
import { SavedBuilds } from "./SavedBuilds";
import { WarehouseInfoDialog } from "./WarehouseInfoDialog";
import { MobileDialog } from "./MobileDialog";
import { useDesktopGate } from "../../lib/desktop";

export function GarageApp() {
  const desktop = useDesktopGate();
  const cars = listCars();
  const floor = listConfigurableCars();
  const [hovered, setHovered] = useState<string>();
  const [selected, setSelected] = useState<string>("ferrari-sf25");
  const [ready, setReady] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const focused = hovered || selected;

  useEffect(() => {
    stopGarageAmbience();
    preloadSounds(INTERFACE_SOUNDS);
    preloadSoundsLater(STUDIO_SOUNDS.filter((src) => !INTERFACE_SOUNDS.includes(src)));
  }, []);

  useEffect(() => {
    if (!selected) return;
    cardRefs.current[selected]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected, open]);

  useEffect(() => watchOverlayOpen(ready && open), [open, ready]);

  const choose = (slug: string) => {
    const car = cars.find((entry) => entry.slug === slug);
    if (!car || car.comingSoon) return;
    window.location.href = `/configure/${car.slug}`;
  };

  const hover = (slug?: string) => {
    const car = slug ? cars.find((entry) => entry.slug === slug) : undefined;
    if (slug && car?.comingSoon) return;
    setHovered(slug);
    if (car && !car.comingSoon) prefetchCar(car);
  };

  if (!desktop) {
    return (
      <TooltipProvider>
        <MobileDialog />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <MenuClickSounds />
      <main className="relative h-dvh overflow-hidden">
        <HotspotLayer>
        <WarehouseCanvas
          focused={focused}
          hovered={hovered}
          selected={selected}
          onSelect={choose}
        />
        {ready ? (
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/50 via-transparent to-background/15 md:bg-linear-to-r md:from-background/80 md:via-background/10 md:to-transparent" />
        ) : null}

        {ready && focused ? (
          <div
            className={cn(
              "pointer-events-none absolute z-20 max-w-[min(18rem,calc(100vw-2rem))] rounded-full bg-background/80 px-4 py-2 text-sm backdrop-blur-md",
              open
                ? "right-4 bottom-[calc(min(68dvh,36rem)+0.75rem)] md:right-6 md:bottom-6"
                : "right-4 bottom-4 md:right-6 md:bottom-6",
            )}
          >
            <span className="text-muted-foreground">
              {hovered ? "Hovering" : "Selected"}{" "}
            </span>
            <span className="font-medium">
              {cars.find((car) => car.slug === focused)?.name}
            </span>
          </div>
        ) : null}

        {ready ? (
        <div className={studioToggleClass(open)}>
          <Button
            size={open ? "icon" : "default"}
            variant="secondary"
            aria-label={open ? "Hide warehouse panel" : "Show warehouse panel"}
            aria-expanded={open}
            className="shadow-lg"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <>
                <ChevronsRight className="rotate-90 md:hidden" />
                <ChevronsLeft className="hidden md:block" />
              </>
            ) : (
              <>
                <PanelLeft />
                Warehouse
              </>
            )}
          </Button>
        </div>
        ) : null}

        <SoundPanel visible={ready} lights />
        <WarehouseInfoDialog
          open={ready && infoOpen}
          onProceed={() => {
            window.localStorage.setItem(STUDIO_INFO_STORAGE_KEY, "1");
            setInfoOpen(false);
          }}
        />

        <aside
          className={studioPanelClass(open)}
          aria-hidden={!open}
        >
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-foreground/20 md:hidden" />
          <p className="mb-3 text-xs font-medium tracking-[0.16em] text-white uppercase">
            Studio Warehouse
          </p>
          <h1 className="font-heading mb-3 text-2xl font-medium tracking-tight md:text-3xl">Pick a car</h1>
          <p className="text-muted-foreground mb-8">
            <span className="md:hidden">Tap a car to look at it, then tap Configure.</span>
            <span className="hidden md:inline">
              Hover a car in the list to look at it, then tap it to open the configurator. Race sessions come next.
            </span>
          </p>

          <div className="mb-8 grid gap-3">
            <Button
              className="btn-chequered w-full disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100"
              size="lg"
              disabled
            >
              <Flag data-icon="inline-start" className="btn-chequered-ready" />
              <Ban data-icon="inline-start" className="btn-chequered-blocked" />
              Race
            </Button>
            <p className="text-muted-foreground text-xs">Coming soon — choose a car and send it out.</p>
          </div>

          <Separator className="mb-8" />

          <section className="grid gap-4">
            {cars.map((car) => {
              const active = focused === car.slug;
              return (
                <Card
                  key={car.slug}
                  ref={(node) => {
                    cardRefs.current[car.slug] = node;
                  }}
                  role={car.comingSoon ? undefined : "button"}
                  tabIndex={car.comingSoon ? -1 : 0}
                  aria-pressed={car.comingSoon ? undefined : active}
                  aria-disabled={car.comingSoon || undefined}
                  className={cn(
                    "gap-0 py-0 [--card-spacing:--spacing(4)] transition-colors",
                    car.comingSoon
                      ? "cursor-default opacity-50"
                      : "cursor-pointer",
                    !car.comingSoon && active
                      ? "ring-2 ring-primary"
                      : !car.comingSoon && "ring-2 ring-white/20",
                  )}
                  onMouseEnter={() => {
                    if (car.comingSoon) return;
                    hover(car.slug);
                    setSelected(car.slug);
                  }}
                  onFocus={() => {
                    if (car.comingSoon) return;
                    hover(car.slug);
                    setSelected(car.slug);
                  }}
                  onMouseLeave={(event) => {
                    const next = event.relatedTarget;
                    if (next instanceof Node && event.currentTarget.contains(next)) return;
                    if (next instanceof Element && next.closest("aside")) {
                      hover(undefined);
                      return;
                    }
                  }}
                  onClick={() => choose(car.slug)}
                  onKeyDown={(event) => {
                    if (car.comingSoon) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      choose(car.slug);
                    }
                  }}
                >
                  <CardHeader className="surface-carbon rounded-t-xl py-(--card-spacing)">
                    <div className="flex items-center gap-2.5">
                      <BrandMark brand={car.brand} className="size-8" />
                      <Badge
                        variant="secondary"
                        className={cn("garage-pill w-fit capitalize", active && "is-selected")}
                      >
                        {car.brand}
                      </Badge>
                      {car.year ? (
                        <span className="text-xs text-white">{car.year}</span>
                      ) : null}
                    </div>
                    <CardTitle className="text-xl text-white">{car.name}</CardTitle>
                    {car.spec ? (
                      <div className="mt-1">
                        <SpecHighlights facts={car.spec.highlights} />
                      </div>
                    ) : null}
                    {car.tagline ? (
                      <CardDescription className="text-white/80">{car.tagline}</CardDescription>
                    ) : null}
                  </CardHeader>

                  <CardFooter className="justify-between">
                    {car.comingSoon ? (
                      <span className="text-muted-foreground">Coming soon</span>
                    ) : (
                      <Button
                        asChild
                        className="btn-chrome"
                        data-active={active ? "true" : undefined}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <a
                          href={`/configure/${car.slug}`}
                          onMouseEnter={() => prefetchConfigure(car)}
                          onFocus={() => prefetchConfigure(car)}
                        >
                          Configure
                          <ArrowRight data-icon="inline-end" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </section>

          <SavedBuilds compact />
        </aside>
        </HotspotLayer>
        <Preloader
          label="Studio"
          name="Warehouse"
          slug="studio-garage"
          stamp="Information"
          roster={floor}
          history={{
            kicker: "",
            headline: "Pick a car",
            body: "Hover a car in the list to look at it, then tap it to open the configurator.",
          }}
          models={garageModelUrls()}
          onDone={() => {
            setReady(true);
            setOpen(isSideOverlay());
            if (window.localStorage.getItem(STUDIO_INFO_STORAGE_KEY) !== "1") {
              setInfoOpen(true);
            }
            void playOneShotSound(STUDIO_GARAGE_ENTRY, STUDIO_GARAGE_ENTRY_VOLUME, true);
          }}
        />
      </main>
    </TooltipProvider>
  );
}
