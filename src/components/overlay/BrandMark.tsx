import type { Brand } from "../../lib/schema";
import { cn } from "@/lib/utils";

export const brandMark: Record<Brand, string> = {
  ferrari: "/ui/brands/ferrari.svg",
  porsche: "/ui/brands/porsche.svg",
  lamborghini: "/ui/brands/lamborghini.svg",
  chevrolet: "/ui/brands/chevrolet.svg",
};

export function BrandMark({ brand, className }: { brand: Brand; className?: string }) {
  return <img src={brandMark[brand]} alt="" className={cn("size-10 shrink-0", className)} />;
}
