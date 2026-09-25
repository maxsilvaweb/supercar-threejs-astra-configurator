import { ArrowLeft, Ban, ChevronsLeft, ChevronsRight, PanelLeft, RotateCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { paintSwatches, rimSwatches } from "../../lib/colors";
import { preloadSound } from "../../lib/play-one-shot-sound";
import { IMPACT_DRILL, SPRAY_PAINT } from "../../lib/constants";
import { isSideOverlay, watchOverlayOpen } from "../../lib/overlay-frame";
import { studioPanelClass, studioToggleClass } from "../../lib/studio-overlay";
import { finishOrder, finishes } from "../../lib/finishes";
import type { CameraPreset, CarDefinition } from "../../lib/schema";
import { useConfig } from "../../lib/store";
import { BrandMark } from "./BrandMark";
import { SpecSheet, SpecSummary } from "./CarSpec";
import { CabinExitButton, canEnterCabin } from "./CabinExitButton";
import { wheels } from "../garage/Wheels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const cameras: { id: CameraPreset; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "threeQuarter", label: "3/4" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
  { id: "detail", label: "Detail" },
];

const sections = [
  { id: "paint", label: "Paint", description: "Body and livery colour" },
  { id: "finish", label: "Finish", description: "Gloss, satin, matte, metal" },
  { id: "wheels", label: "Wheels", description: "Factory or aftermarket" },
  { id: "options", label: "Options", description: "Aero packages" },
  { id: "spec", label: "Spec", description: "Engine and performance" },
  { id: "environment", label: "Studio", description: "Camera presets" },
] as const;

type SectionId = (typeof sections)[number]["id"];

const designSections = new Set<SectionId>(["paint", "finish", "wheels", "options"]);

function ApplyStatus() {
  const applying = useConfig((state) => state.applying);
  const status = useConfig((state) => state.applyStatus);

  if (!applying) return null;

  return (
    <div className="mb-8 space-y-3" role="status" aria-live="polite" aria-busy="true">
      <p className="text-lg font-medium tracking-tight text-white">{status || "Applying option"}</p>
      <div className="space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="apply-bar bg-primary h-full rounded-full" />
        </div>
        <p className="text-muted-foreground text-xs">Updating the car</p>
      </div>
    </div>
  );
}

function colourName(hex: string, swatches: { label: string; hex: string }[]) {
  return swatches.find((swatch) => swatch.hex.toLowerCase() === hex.toLowerCase())?.label || hex;
}

function SwatchRow({
  value,
  onChange,
  swatches,
}: {
  value: string;
  onChange: (hex: string) => void;
  swatches: { id: string; label: string; hex: string }[];
}) {
  const selected = value.toLowerCase();
  const named = swatches.some((swatch) => swatch.hex.toLowerCase() === selected);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="Paint colour">
        {swatches.map((swatch) => {
          const active = selected === swatch.hex.toLowerCase();
          return (
            <button
              key={swatch.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={cn("paint-swatch", active && "is-active")}
              style={{ backgroundColor: swatch.hex }}
              title={swatch.label}
              aria-label={swatch.label}
              onClick={() => onChange(swatch.hex)}
            />
          );
        })}
        <label className={cn("paint-swatch paint-swatch-custom", !named && "is-active")} title="Custom colour">
          <input
            type="color"
            className="size-full cursor-pointer opacity-0"
            value={value}
            aria-label="Custom colour"
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
      <p className="flex items-center gap-2 text-xs text-white">
        <span className="paint-swatch-key" style={{ backgroundColor: value }} aria-hidden />
        {colourName(value, swatches)}
      </p>
    </div>
  );
}

function PaintPanel({ car }: { car: CarDefinition }) {
  const paints = useConfig((state) => state.paints);
  const setPaint = useConfig((state) => state.setPaint);
  const [groupId, setGroupId] = useState(car.paintGroups[0]?.id || "");
  const active = car.paintGroups.find((group) => group.id === groupId) || car.paintGroups[0];

  if (!active) {
    return <p className="text-muted-foreground">No paint groups defined for this model.</p>;
  }

  return (
    <div className="space-y-5">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={3}
        value={active.id}
        onValueChange={(value) => value && setGroupId(value)}
        className="flex-wrap justify-start gap-2"
      >
        {car.paintGroups.map((group) => (
          <ToggleGroupItem key={group.id} value={group.id}>
            {group.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <SwatchRow
        value={paints[active.id] || "#FF2800"}
        onChange={(hex) => setPaint(active.id, hex)}
        swatches={paintSwatches}
      />
    </div>
  );
}

function SectionBody({ car, section }: { car: CarDefinition; section: SectionId }) {
  const state = useConfig();
  const locked = state.cameraPreset === "interior" && designSections.has(section);

  const body =
    section === "paint" ? (
      <PaintPanel car={car} />
    ) : section === "finish" ? (

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={3}
          value={state.finish}
          onValueChange={(value) => value && state.setFinish(value as typeof state.finish)}
          className="flex-wrap justify-start gap-2"
        >
          {finishOrder.map((id) => (
            <ToggleGroupItem key={id} value={id}>
              {finishes[id].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : section === "wheels" ? (
        <div className="space-y-5">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={3}
            value={state.wheel}
            onValueChange={(value) => value && state.setWheel(value as typeof state.wheel)}
            className="flex-wrap justify-start gap-2"
          >
            {wheels.map((wheel) => (
              <ToggleGroupItem key={wheel.id} value={wheel.id}>
                {wheel.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {state.wheel === "aftermarket" && (
            <SwatchRow value={state.rimColor} onChange={state.setRimColor} swatches={rimSwatches} />
          )}
        </div>
      ) : section === "options" ? (
        car.aeroParts.length === 0 ? (
          <p className="text-muted-foreground">No optional equipment is available on this model.</p>
        ) : (
          <div className="space-y-5">
            {car.aeroParts.map((part) => (
              <div key={part.id} className="flex items-center justify-between gap-6 py-0.5">
                <Label htmlFor={part.id}>{part.label}</Label>
                <Switch
                  id={part.id}
                  checked={state.aero[part.id] ?? part.defaultVisible}
                  onCheckedChange={(checked) => state.setAero(part.id, checked)}
                />
              </div>
            ))}
          </div>
        )
      ) : section === "spec" ? (
        car.spec ? (
          <SpecSheet facts={car.spec.details} />
        ) : (
          <p className="text-muted-foreground">No specification is listed for this model.</p>
        )
      ) : (
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={3}
          value={state.cameraPreset}
          onValueChange={(value) => value && state.setCameraPreset(value as CameraPreset)}
          className="flex-wrap justify-start gap-2"
        >
          {cameras
            .concat(canEnterCabin(car) ? [{ id: "interior" as const, label: "Inside" }] : [])
            .map((camera) => (
              <ToggleGroupItem key={camera.id} value={camera.id}>
                {camera.label}
              </ToggleGroupItem>
            ))}
        </ToggleGroup>
      );

  return (
    <div className="space-y-3">
      {locked ? (
        <p className="text-muted-foreground text-sm">Exit the car to change design options.</p>
      ) : null}
      <div
        className={cn(locked && "pointer-events-none opacity-45")}
        aria-disabled={locked}
      >
        {body}
      </div>
    </div>
  );
}

export function Tuner({ car, revealed = true }: { car: CarDefinition; revealed?: boolean }) {
  const state = useConfig();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SectionId>("paint");

  useEffect(() => {
    preloadSound(IMPACT_DRILL);
    preloadSound(SPRAY_PAINT);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    setOpen(isSideOverlay());
  }, [revealed]);

  useEffect(() => {
    const stop = watchOverlayOpen(revealed && open);
    return () => {
      stop();
    };
  }, [open, revealed]);

  const interior = state.cameraPreset === "interior";

  useEffect(() => {
    if (interior && designSections.has(section)) setSection("environment");
  }, [interior, section]);

  return (
    <>
      <CabinExitButton car={car} visible={revealed && interior} hint={revealed} />

      {revealed ? (
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/50 via-transparent to-background/15 md:bg-linear-to-r md:from-background/80 md:via-background/10 md:to-transparent" />
      ) : null}

      {revealed ? (
      <div className={studioToggleClass(open)}>
        <Button
          size={open ? "icon" : "default"}
          variant="secondary"
          aria-label={open ? "Hide configure panel" : "Show configure panel"}
          aria-expanded={open}
          className="btn-glossy shadow-lg"
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
              Configure
            </>
          )}
        </Button>
      </div>
      ) : null}

      <aside
        className={studioPanelClass(open)}
        aria-hidden={!open}
        aria-busy={state.applying}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-foreground/20 md:hidden" />
        <p className="mb-3 text-xs font-medium tracking-[0.16em] text-white uppercase">
          Configure
        </p>
        <div className="mb-3 flex items-center gap-2.5">
          <BrandMark brand={car.brand} />
          <Badge
            variant="secondary"
            className={cn(
              "w-fit capitalize",
              car.brand === "ferrari" && "brand-pill-ferrari",
              car.brand === "porsche" && "brand-pill-porsche",
              car.brand === "lamborghini" && "brand-pill-lamborghini",
            )}
          >
            {car.brand}
          </Badge>
          {car.year ? <span className="text-xs text-white">{car.year}</span> : null}
        </div>
        <h1 className="font-heading mb-4 text-2xl font-medium tracking-tight !text-white md:text-3xl">
          {car.name}
          {car.tagline ? <span className="text-muted-foreground"> {car.tagline}</span> : null}
        </h1>
        {car.spec ? <SpecSummary facts={car.spec.summary} /> : null}

        <div className="mb-8 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="btn-chrome" asChild>
            <a href="/">
              <ArrowLeft data-icon="inline-start" />
              Back to Studio Warehouse
            </a>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="btn-chrome"
            aria-label="Rotate"
            aria-pressed={state.autoRotate}
            data-active={state.autoRotate}
            disabled={interior}
            onClick={() => state.setAutoRotate(!state.autoRotate)}
          >
            <RotateCw data-icon="inline-start" />
            Rotate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="btn-chrome disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="Save"
            disabled
            onClick={() => state.saveBuild(window.carModelerCapture?.())}
          >
            <Save data-icon="inline-start" className="btn-chrome-ready" />
            <Ban data-icon="inline-start" className="btn-chrome-blocked" />
            Save
          </Button>
        </div>

        <Separator className="mb-8" />

        <ApplyStatus />

        <section className={cn("grid gap-4", state.applying && "pointer-events-none opacity-55")}>
          {sections
            .filter((item) => item.id !== "options" || car.aeroParts.length > 0)
            .filter((item) => item.id !== "wheels" || car.hideWhenAftermarket)
            .filter((item) => item.id !== "spec" || car.spec)
            .map((item) => {
            const active = section === item.id;
            const designLocked = interior && designSections.has(item.id);
            return (
              <Card
                key={item.id}
                role="button"
                tabIndex={designLocked ? -1 : 0}
                aria-pressed={active}
                aria-disabled={designLocked}
                className={cn(
                  "cursor-pointer gap-0 py-0 [--card-spacing:--spacing(4)] transition-colors",
                  active ? "ring-2 ring-primary" : "ring-2 ring-white/20 hover:ring-primary",
                  designLocked && "pointer-events-none opacity-45",
                )}
                onClick={() => {
                  if (!designLocked) setSection(item.id);
                }}
                onKeyDown={(event) => {
                  if (designLocked) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSection(item.id);
                  }
                }}
              >
                <CardHeader
                  className={cn(
                    "surface-carbon py-(--card-spacing)",
                    active ? "rounded-t-xl" : "rounded-xl",
                  )}
                >
                  <CardTitle className="text-xl text-white">{item.label}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                {active ? (
                  <CardContent className="border-t border-white/10 bg-background py-(--card-spacing)">
                    <SectionBody car={car} section={item.id} />
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </section>
      </aside>
    </>
  );
}
