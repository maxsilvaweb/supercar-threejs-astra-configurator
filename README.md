# silvaweb studio

A desktop garage for looking at the cars and configuring them.

## Tech

<a href="https://astro.build"><img src="https://cdn.simpleicons.org/astro/FF5D01" width="40" height="40" alt="Astro"></a>
&nbsp;
<a href="https://react.dev"><img src="https://cdn.simpleicons.org/react/61DAFB" width="40" height="40" alt="React"></a>
&nbsp;
<a href="https://www.typescriptlang.org"><img src="https://cdn.simpleicons.org/typescript/3178C6" width="40" height="40" alt="TypeScript"></a>
&nbsp;
<a href="https://threejs.org"><img src="https://cdn.simpleicons.org/threedotjs/000000" width="40" height="40" alt="Three.js"></a>
&nbsp;
<a href="https://tailwindcss.com"><img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="40" height="40" alt="Tailwind CSS"></a>
&nbsp;
<a href="https://vite.dev"><img src="https://cdn.simpleicons.org/vite/646CFF" width="40" height="40" alt="Vite"></a>
&nbsp;
<a href="https://www.radix-ui.com"><img src="https://cdn.simpleicons.org/radixui/161618" width="40" height="40" alt="Radix UI"></a>

Astro serves the pages. React runs the garage, the configurator, and the 3D scene through React Three Fiber, Drei, and postprocessing. Zustand holds the build. Tailwind and Radix style the panels.

## Why both Astro and React

Astro owns the site shell: the HTML document, the two routes, and the model preloads. Each configure URL is a static page generated from the car list.

React owns everything that has to stay live: the canvas, paint, camera, doors, and sound. Those pieces are mounted with `client:only="react"` because a WebGL scene cannot be rendered as static HTML.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4321`. The studio is desktop only.
