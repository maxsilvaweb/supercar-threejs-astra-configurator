import type { APIRoute } from "astro";

const robots = (sitemap: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemap.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("sitemap-index.xml", site ?? "https://supercar-threejs-astra-configurator.vercel.app");
  return new Response(robots(sitemap), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
