# Magikarp World artwork

The alternate portfolio theme is available at `/?world=magikarp`. Both worlds
use the same content and project links. The original forest is the default.
The world switch and résumé-game entry link are temporarily hidden; direct
preview URLs still work. The coastal art fills the entire hero, with the
character integrated into the water and a message shown only after Splash.

Both raster assets were created with the built-in image-generation tool.
They are original generated assets inspired by the requested handheld game
aesthetic. No game assets or screenshots were downloaded.

| Production asset | Dimensions | Preparation |
| --- | --- | --- |
| `dist/Images/magikarp-coast.webp` | 768 × 576 | Nearest-neighbor resize, 192-color palette without dithering, lossless WebP |
| `dist/Images/magikarp-sprite.webp` | 128 × 128 | Transparent margin trim, nearest-neighbor contain resize, 64-color palette, lossless WebP with alpha |

## Environment prompt

Use case: stylized-concept. Asset type: pixel-art environment background for a portfolio's interactive world-map hero, displayed about 650 by 520 CSS pixels. Create a polished original 4:3 tile-based coastal town route, very closely evoking the bright overhead 2004 Game Boy Advance Pokemon FireRed environment aesthetic. STRICT top-down orthographic 2D tiled game view, 16x16 pixel tiles, visually consistent pixel grid and hard pixel edges, limited saturated GBA palette, no antialiasing, no gradients, no soft light or painterly texture. Scene: a large calm turquoise-blue inlet and pond occupies the middle and lower right with repeated tiny lighter-blue pixel ripples, a curved sandy shore, light-green grassy banks, short dark-green round trees in rows, a small red-roof coastal house near the upper left, wooden pier jutting from the lower-left shore into the water, a few gray shoreline rocks, tiny flowers, path. World fills the whole image edge to edge. Broad uncluttered water in the central-right 50% leaves room for a separate Magikarp character overlay. Charming authentic handheld-RPG tiles, realistic pixel density (like a 384x288 pixel game scene upscaled cleanly), crisp and intentional. Do not include characters, Pokemon, fish, logos, labels, text, HUD, frames, screenshots of a console, or watermarks. No perspective, no isometric landscape, no realistic shadows.

## Character prompt

Create one charming pixel art Magikarp on a transparent background for a personal website. Side view facing right: orange carp body, big white surprised eye, cream open mouth, yellow whiskers and crown-shaped dorsal fin, white tail and side fins. The complete fish is visible. Crisp square pixel art in the style of a 64 by 64 handheld RPG sprite enlarged with nearest-neighbor. Dark pixel outline, flat limited colors. No scenery, text, watermark, shadow, or border. Real transparent background.

## Integration

- `world-theme-init.js` reads the query before paint and preloads the selected world's background.
- `magikarp-world.css` scopes the palette, tiled scenery, dialogue frames, and animation to the selected world. The switch layout is shared.
- `world-theme.js` loads the character/portrait and handles Splash without a modal. It supports keyboard activation, reduced motion, and message dismissal with Escape or an outside click.
- `script.js` uses Magikarp as the map character in this world.
- `sanctuary.js` keeps the forest discoveries exclusive to the forest world.

Validation: syntax and HTML structure checks; unchanged-content comparison;
desktop preview; 390px and 320px iframe viewport checks; Splash; map travel;
Research shortcut selection; screenshot viewer open/Escape/focus restoration;
and switching back to the original forest. The new theme's computed text
colors were checked for contrast on their solid backgrounds.

The full-bleed revision also verifies that the scene matches the entire hero
at desktop and phone widths, that Magikarp stays below the copy on phones,
and that both new-world entry links are hidden on the default forest page.
