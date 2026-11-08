# Prompt: a drive-around portfolio world

Paste this into Claude Code (Opus 5.5), in an empty folder. Fill in the brackets first. The audit it points to is `audit.md` next to this file. Link it, or paste it in under the prompt.

---

Build my portfolio as a small 3D world you explore in a funky vehicle, in the browser. The reference for feel is Bruno Simon's site (bruno-simon.com); the audit is here: https://github.com/clotheshoesandwoes/web-refs/blob/main/sites/bruno-simon/audit.md. Read it first. Take the grammar: toy physics, one-palette low-poly look, achievements as the tutorial. Make everything else original: my world, my vehicle, my ability, my layout. Copy none of his models, places or text.

**About me:** [name, what I do, one line of personality]
**My projects** (each becomes a place in the world): [project 1: one line + link], [project 2], [project 3], [contact/socials]
**My world's theme:** [e.g. a desert mesa at dusk / a tiny harbor town / a junkyard / a floating island]
**My vehicle and its ability:** [e.g. a mini forklift that lifts and throws props / a hovercraft with a ground-pound / a three-wheeler with a grappling hook]. If I left this blank, pitch three and pick the funniest.

**Stack:** Vite + three.js (WebGPU renderer with the WebGL2 fallback, TSL materials) + Rapier for physics + Howler for sound. No framework. Plain JS classes, one ordered update loop (inputs, player, vehicle pre-physics, physics, vehicle post-physics, camera, world, render).

**Look:**
- Low-poly shapes under good light. One palette texture for every model (UVs point at color swatches); 3-4 hues per area, picked by hand.
- One shared custom material: Lambert plus soft core shadows, caught drop shadows, a little fake bounce light, distance fog in the palette color.
- Dense instanced grass (tens of thousands of blades, one draw) with wind; the vehicle parts it and leaves tracks.
- Light post: soft bloom only on true highlights, and a gentle edge blur so it reads as a miniature.
- Small life: leaves, dust, fireflies near lights. The intro is a reveal where the world grows out from the vehicle; no loading bar.

**Physics and vehicle:**
- A Rapier raycast vehicle, tuned like a toy, not a sim: snappy steering, a low top speed, a boost (Shift) with a trail.
- The ability: [mine]. Build it from physics (impulses, suspension changes, joints), never canned animation, so it interacts with everything.
- Every prop is a dynamic body that sleeps until touched: signs, letters of my name, crates, fences, cones.
- An explosive or otherwise chaotic prop, with one moment of slow motion on a big hit.
- Self-righting when upside down; R respawns at the nearest checkpoint; an "I'm stuck" button.
- Every impact plays a sound chosen by material and scaled by speed.

**Camera:** a high three-quarter follow cam on a smoothed focus point, a slight zoom-out with speed, gently framing whichever place you're near.

**Gameplay:**
- Each project is a place with one interaction (drive onto a pad, knock something over, open a screen) that shows the project.
- Achievements that teach the controls the first time you do something ("You found the boost").
- 2-3 secrets worth finding. A map button.
- Inputs as named actions: keyboard, gamepad and a touch joystick for phones.
- A plain text page with the same content, linked from the menu, for people who don't want to drive.

**How to work:**
1. First playable in one pass: flat ground, the vehicle driving with boost and the ability, 20 knockable props, the camera. Run it, screenshot it, tell me what to look at.
2. Then the look: palette, material, grass, fog, post. Screenshot before/after.
3. Then one project place at a time. Each step must run before the next starts.
4. Keep a Tweakpane debug panel (`#debug`) on every tuning number so I can feel-tune the vehicle myself.
5. Target 60 fps on a mid laptop; two quality levels.

Keep replies short: what changed, what to look at.
