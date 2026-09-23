import { cn } from "@/lib/utils";

export function studioPanelClass(open: boolean) {
  return cn(
    "absolute z-20 overflow-y-auto overscroll-contain border-white/10 bg-background/80 backdrop-blur-xl transition-transform duration-300",
    "inset-x-0 bottom-0 max-h-[min(68dvh,36rem)] rounded-t-2xl border-t px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
    "md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[min(28rem,40vw)] md:rounded-none md:border-t-0 md:border-r md:px-6 md:py-8 lg:px-8 lg:py-10",
    open
      ? "pointer-events-auto translate-y-0 md:translate-x-0"
      : "pointer-events-none translate-y-full md:translate-y-0 md:-translate-x-full",
  );
}

export function studioToggleClass(open: boolean) {
  return cn(
    "absolute z-50 flex items-center gap-3",
    "top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))]",
    open && "max-md:top-auto max-md:bottom-[calc(min(68dvh,36rem)+0.75rem)] md:left-[calc(min(28rem,40vw)+1rem)]",
  );
}
