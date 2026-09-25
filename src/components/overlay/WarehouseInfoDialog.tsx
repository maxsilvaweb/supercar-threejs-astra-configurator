import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const specs = [
  ["Screen", "Laptop or desktop"],
  ["Browser", "Chrome, Edge, Safari, or Firefox"],
  ["Graphics", "WebGL 2"],
  ["Memory", "8 GB RAM"],
  ["Network", "Stable connection"],
] as const;

export function StudioSpec() {
  return (
    <dl className="sound-console-well">
      {specs.map(([label, value]) => (
        <div key={label} className="sound-console-row">
          <dt className="text-[0.7rem] tracking-wide text-white/80">{label}</dt>
          <dd className="m-0 max-w-[14rem] text-right text-[0.7rem] leading-snug font-medium tracking-wide text-white">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function WarehouseInfoDialog({
  open,
  onProceed,
}: {
  open: boolean;
  onProceed: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[80] grid place-items-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="warehouse-info-title"
        className="w-full max-w-md overflow-hidden rounded-xl ring-1 ring-white/15"
      >
        <div className="btn-chrome flex items-center gap-2.5 rounded-none px-5 py-3">
          <Info className="size-5" strokeWidth={2.2} />
          <h2 id="warehouse-info-title" className="font-heading text-lg font-medium tracking-tight">
            Information
          </h2>
        </div>
        <div className="space-y-6 bg-background px-5 py-5">
          <p className="text-sm leading-relaxed text-white/85">
            This is the first beta of the studio. More cars are on the way. A computer with the
            spec below will run it.
          </p>
          <StudioSpec />
          <Button className="btn-chrome w-full" size="lg" onClick={onProceed}>
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
