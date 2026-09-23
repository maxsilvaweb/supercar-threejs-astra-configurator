import { Info } from "lucide-react";

export function MobileBlock() {
  return (
    <div className="relative h-dvh overflow-hidden bg-background">
      <div className="absolute inset-0 z-[80] grid place-items-center bg-black/70 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-block-title"
          className="w-full max-w-md overflow-hidden rounded-xl ring-1 ring-white/15"
        >
          <div className="btn-chrome flex items-center gap-2.5 rounded-none px-5 py-3">
            <Info className="size-5" strokeWidth={2.2} />
            <h2 id="mobile-block-title" className="font-heading text-lg font-medium tracking-tight">
              Information
            </h2>
          </div>
          <div className="bg-background px-5 py-5">
            <p className="text-sm leading-relaxed text-white/85">
              This studio only works on desktop. Please open it on a computer — phones and small
              screens are not supported yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
