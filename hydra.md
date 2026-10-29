# Our own Hydra

Hydra is the engine Active Theory built in-house. The source is private, but you can see its parts in the live bundle on activetheory.net. Every part has an open-source stand-in you can use today. The thing that makes their sites good is not the renderer. It's the **editor that turns every look decision into a tuned number**, plus the discipline to only use 3D when the subject is spatial.

## What Hydra is made of

Read from `activetheory.net/assets/js/app.*.js` (1.8 MB raw, 348 KB compressed) and `assets/data/uil.*.json` on 2026-10-28.

| Hydra part | What it does | Open-source stand-in (stats as of 2026-10-28) |
|---|---|---|
| Renderer (`Base3D`, `Scene`, `PerspectiveCamera`, PBR, shadows) | Its own WebGL2 renderer, with an API close to three.js | [three.js](https://github.com/mrdoob/three.js) ★117k, pushed 2026-10-28 |
| **SceneLayout + UIL** (`uil.json`, 220 KB) | A visual editor. Every camera position, FOV, lerp speed, material value and shader uniform is a named number, tuned by eye and saved to JSON | [Tweakpane](https://github.com/cocopon/tweakpane) ★4.6k / [lil-gui](https://github.com/georgealways/lil-gui) ★1.7k with a save-to-JSON hook (see below). For a full visual editor: [Triplex](https://github.com/pmndrs/triplex) ★1.3k (React Three Fiber), [three.js editor](https://threejs.org/editor/), or [Theatre.js](https://github.com/theatre-js/theatre) ★12.8k (timelines; stalled since 2024-08) |
| `FXLayer`, `UnrealBloomComposite`, volumetric light | Post-processing layers | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) ★2.9k, 2026-10-05 |
| `Proton` | GPU particles | three.js compute particles (WebGPU/TSL examples) or [three.quarks](https://github.com/Alchemist0823/three.quarks) ★1.1k, 2026-05-21 |
| `GLText`, `Text3D`, MSDF | Crisp type rendered inside WebGL | [troika-three-text](https://github.com/protectwise/troika) ★2.0k, 2026-07-24. Active Theory's own [svg2msdf](https://github.com/activetheory/svg2msdf) for logos |
| Draco, KTX2/Basis, `Thread` | Compressed meshes and textures, decoded off the main thread | [glTF-Transform](https://github.com/donmccurdy/glTF-Transform) ★2.0k, 2026-10-20 (one CLI command compresses a .glb). three.js loaders already decode in workers |
| `GPU.lt(n)`, `Device.mobile` | Quality tiers per device | [detect-gpu](https://github.com/pmndrs/detect-gpu) ★1.2k, 2026-10-25 |
| `GLA11y` | Hidden DOM layer for screen readers | Do it the other way round: real HTML content, canvas behind it |
| `Tween`, `Timeline` | Motion | [GSAP](https://github.com/greensock/GSAP) ★29.9k (all plugins free) |

## Three ways to have one

**A. A small kit on three.js. Recommended.** A Vite project you copy for each site:

- **`tune.json` + Tweakpane.** Every tunable value lives in one JSON file. In dev, a panel edits it live and a tiny Vite plugin writes changes back to disk. In production, the panel is stripped and the JSON is read. This is the part that makes it feel like Hydra: you judge by eye, then the value is saved.
- **`Quality`** from detect-gpu: tier 0 gets a still image or CSS, tier 1 a cheap path, tier 2+ the full scene. Plus `prefers-reduced-motion`.
- **`Assets`**: one loader for GLTF, Draco and KTX2, plus a `scripts/compress` step using glTF-Transform.
- **`Text`**: troika for any type inside the scene. Keep body copy as real HTML.
- **`Post`**: pmndrs/postprocessing, off by default and switched on per scene.
- **`Ticker`**: one render loop. It pauses when the tab is hidden and handles context loss.

The structure to copy is Bruno Simon's [folio-2025](https://github.com/brunosimon/folio-2025) (★2.0k, MIT). It has `Debug.js`, `Quality.js`, `ResourcesLoader.js`, `Ticker.js`, `Rendering.js`, `Viewport.js` and `scripts/compress.js`, which is the same split as Hydra at one-person size.

**B. The React route.** [react-three-fiber](https://github.com/pmndrs/react-three-fiber) (★33k) + [drei](https://github.com/pmndrs/drei) (★10k) + [leva](https://github.com/pmndrs/leva) (★6.3k, tweak panel) + [Triplex](https://triplex.dev) (visual editor). Use it when the site is already React. Svelte has the same thing in [Threlte](https://github.com/threlte/threlte) (★3.4k).

**C. An engine and editor off the shelf.** Use one of these when the project is a world or a game rather than a website:

- [PlayCanvas](https://playcanvas.com): [engine](https://github.com/playcanvas/engine) ★17k plus [editor](https://github.com/playcanvas/editor) ★1.4k, both MIT and both active.
- [Babylon.js](https://github.com/BabylonJS/Babylon.js) ★26k: inspector and node material editor.
- [Needle Engine](https://needle.tools): Unity or Blender as the editor, three.js output. It isn't MIT, so read the license before client work.

## Learn from

- **[folio-2025 source](https://github.com/brunosimon/folio-2025)**: the closest public "small Hydra". Read `sources/Game/` top to bottom.
- **[Discover three.js](https://discoverthreejs.com)**: a free book on structuring a three.js app (World, systems, components). It's the architecture chapter Hydra would have.
- **[three.js examples](https://threejs.org/examples/)**: every effect, with source. View source on the one you need.
- **[Maxime Heckel's blog](https://blog.maximeheckel.com)**: long shader and R3F write-ups with live demos (particles, refraction, caustics, post-processing).
- **[The Book of Shaders](https://thebookofshaders.com)**: start here before writing any shader.
- **[Three.js Journey](https://threejs-journey.com)**: Bruno Simon's paid course, the most direct path from zero to studio-level work.
- **[Codrops](https://tympanus.net/codrops/)**: case studies of studio sites with code. Filter hard, because many demos are effects without a subject.
- **[Active Theory on GitHub](https://github.com/activetheory)**: the small pieces they did open-source (split-text, svg2msdf, activeframe).
- **[Active Theory, "Craft Matters"](https://lbbonline.com/news/Craft-Matters-by-Active-Theory)**: the stance to hold the kit to. Use 3D only when it deepens the experience. Use fog and light instead of detail. Stylised beats realistic.

## Order of work

1. Build kit A once, as a repo of its own. The core is the tweak panel that saves to `tune.json`, and the rest is plumbing.
2. Use it on one real subject that is spatial: a venue, an object, a place. Write the one-sentence idea first.
3. Tune by eye with the panel and screenshot the phone and desktop.
4. Write the teardown of your own site into `sites/` here, the same way as the others.
