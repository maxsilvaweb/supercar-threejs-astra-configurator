import type { Brand } from "../../lib/schema";
import { cn } from "@/lib/utils";

export const brandLabel: Record<Brand, string> = {
  ferrari: "Ferrari",
  porsche: "Porsche",
  lamborghini: "Lamborghini",
  chevrolet: "Chevrolet",
  "aston-martin": "Aston Martin",
  toyota: "Toyota",
  bugatti: "Bugatti",
  mclaren: "McLaren",
  audi: "Audi",
  honda: "Honda",
};

export const brandMark: Record<Brand, string> = {
  ferrari: "/ui/brands/ferrari.svg",
  porsche: "/ui/brands/porsche.svg",
  lamborghini: "/ui/brands/lamborghini.svg",
  chevrolet: "/ui/brands/chevrolet.svg",
  "aston-martin": "/ui/brands/aston-martin.svg?v=2",
  toyota: "/ui/brands/toyota.svg",
  bugatti: "/ui/brands/bugatti.svg",
  mclaren: "/ui/brands/mclaren.svg?v=3",
  audi: "/ui/brands/audi.svg",
  honda: "/ui/brands/honda.svg",
};

export function BrandMark({ brand, className }: { brand: Brand; className?: string }) {
  const wide = brand === "aston-martin" || brand === "mclaren";
  return (
    <img
      src={brandMark[brand]}
      alt=""
      className={cn("shrink-0 object-contain", wide ? "h-7 w-auto" : "size-10", className)}
    />
  );
}
