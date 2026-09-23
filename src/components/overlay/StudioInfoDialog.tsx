import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudioInfoDialog({
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
        aria-labelledby="studio-info-title"
        className="w-full max-w-md overflow-hidden rounded-xl ring-1 ring-white/15"
      >
        <div className="btn-chrome flex items-center gap-2.5 rounded-none px-5 py-3">
          <Info className="size-5" strokeWidth={2.2} />
          <h2 id="studio-info-title" className="font-heading text-lg font-medium tracking-tight">
            Information
          </h2>
        </div>
        <div className="space-y-6 bg-background px-5 py-5">
          <p className="text-sm leading-relaxed text-white/85">
            This is the first beta of the studio. More cars are on the way. Please view it on a
            desktop for the best experience.
          </p>
          <Button className="btn-chrome w-full" size="lg" onClick={onProceed}>
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
