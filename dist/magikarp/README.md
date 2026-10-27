# Splash Island — a playable résumé

A separate, browser-only résumé experience for Zelun He at `/magikarp/`.

- Arrow keys or WASD move Magikarp; E / Space / Enter on the game canvas opens a nearby landmark.
- Clicking the world finds a collision-safe cardinal route. Clicking a building routes to its entrance.
- The field journal routes to all six résumé stops or opens their readable chapter directly.
- Touch direction pad and Explore button support mobile play.
- Six collectible story scales persist in local storage; unavailable storage does not prevent play.
- Optional synthesized sound starts only after choosing Sound on; reduced-motion preferences suppress bobbing and water glints.
- A keyboard-accessible readable tour and ordinary résumé PDF link provide alternatives to the canvas.

All rendering is code-native Canvas 2D. There are no downloaded game tiles, sprites, music, external art assets, runtime libraries, or backend calls. Magikarp / Pokémon are third-party characters; this is an unofficial, non-endorsed fan tribute with an original map and drawings.

Content follows the existing portfolio and résumé. Working gene-classification research remains explicitly identified as not peer reviewed.

## Files

- `data.mjs`: résumé chapters and destination links.
- `world.mjs`: tile world, collisions, breadth-first routing, and progress validation.
- `art.mjs`: original pixel drawings and terrain renderer.
- `game.mjs`: rendering, keyboard/pointer/touch input, dialogs, audio, and saved progress.
- `style.css`, `index.html`: responsive interface, native dialogs, and readable tour.

## Validate

```sh
node --test world.test.mjs
node --check game.mjs
node --check art.mjs
```

Run locally with `python3 -m http.server 8000` from the parent static site directory. Open `/magikarp/`. The production portfolio is a buildless static site served from `dist/`; the old Next.js app is not involved.
