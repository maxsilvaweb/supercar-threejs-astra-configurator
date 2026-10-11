import { brandLabel } from "../components/overlay/BrandMark";
import { carPreviewUrl } from "./constants";
import type { CarDefinition } from "./schema";

export const SITE_ORIGIN = "https://supercar-threejs-astra-configurator.vercel.app";
export const SITE_NAME = "silvaweb studio";
export const DEFAULT_OG_IMAGE = carPreviewUrl("studio-garage");

export const WAREHOUSE_TITLE = SITE_NAME;
export const WAREHOUSE_DESCRIPTION =
  "A 3D warehouse of supercars. Look around the garage, then open a car to paint, finish, and sit inside.";

export function carPageTitle(car: CarDefinition) {
  return `${car.name} · silvaweb`;
}

export function carPageDescription(car: CarDefinition) {
  if (car.history?.body) return car.history.body;
  const brand = brandLabel[car.brand];
  const year = car.year ? ` ${car.year}` : "";
  return `Configure the${year} ${brand} ${car.name} in 3D at silvaweb studio.`;
}

export function absoluteUrl(path: string, origin = SITE_ORIGIN) {
  const url = new URL(path, origin);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.href;
}

export function warehouseJsonLd(cars: CarDefinition[], origin = SITE_ORIGIN) {
  const listed = cars.filter((car) => !car.comingSoon);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: origin,
        description: WAREHOUSE_DESCRIPTION,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
      },
      {
        "@type": "ItemList",
        name: "Configurable cars",
        numberOfItems: listed.length,
        itemListElement: listed.map((car, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/configure/${car.slug}`, origin),
          name: car.name,
        })),
      },
    ],
  };
}

export function carJsonLd(car: CarDefinition, origin = SITE_ORIGIN) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: car.name,
    brand: { "@type": "Brand", name: brandLabel[car.brand] },
    model: car.name,
    vehicleModelDate: car.year || undefined,
    description: carPageDescription(car),
    image: absoluteUrl(carPreviewUrl(car.slug), origin),
    url: absoluteUrl(`/configure/${car.slug}`, origin),
  };
}
