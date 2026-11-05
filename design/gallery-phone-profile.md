# Gallery resource audit and phone profiling

Status: resource changes implemented; **physical-device profiling has not been run**.
The editing session had no usable browser/device or shell runner. JavaScript syntax
and the deterministic mock suite were checked in the code execution runtime.
These checks are not measurements of browser frame rate, GPU completion time,
thermal behavior, or device memory.

## Changes

- Begin enhancement within 600 CSS pixels of the gallery, rather than on page load.
- Decode at most two source images at once; preserve project order and release
  image references. Phone/coarse-pointer, Save-Data and <=4 GiB reported-memory
  devices use source surfaces no larger than 1024 pixels on either axis.
- Keep desktop surfaces up to 2048 pixels. Prepare power-of-two texture dimensions
  separately for each axis and respect MAX_TEXTURE_SIZE.
- Upload textures only for cards whose projected bounds intersect the viewport.
  Delete textures for cards that leave it; release all GL textures when the
  stage is offscreen, the document is hidden, or the finale replaces the canvas.
- Preserve scroll easing and settle motion, then stop scheduling gallery frames.
  Scrolling, resize and visibility changes wake it again.
- Cap the phone render buffer at DPR 1.5 (desktop 2).
- Reduced-motion and image/renderer failures retain the semantic static content.

The two-at-a-time decoder queue still prepares the six bounded CPU surfaces
before enabling the gallery. It is not per-card network streaming: semantic
project images elsewhere on the page may also be requested by the browser.

## Allocation estimates, not measured memory

RGBA8 plus the full mip chain:

| Allocation | Before | Updated phone policy |
| --- | ---: | ---: |
| Six worst-case square textures | ~128 MiB | <=32 MiB |
| One typical wide card | 21.33 MiB (2048x2048) | 2.67 MiB (1024x512) |
| GPU textures before first gallery draw | Six | Zero |
| GPU textures after gallery suspension | Retained | Zero |

Only viewport-intersecting cards are resident during drawing, so the six-texture
number is an upper bound. This excludes CPU source canvases, decoded image/cache
storage, temporary upload canvases, framebuffer/antialiasing overhead, other page
effects and driver-specific storage. Small compressed downloads do not establish
small decoded or GPU allocations.

## Repeatable resource test

Run:

```sh
node scripts/test-gallery-resources.mjs
```

The same test body passed 30 assertions in the editing runtime. It checks phone
and hardware limits, power-of-two dimensions, two decoder lanes, failed-load
cleanup, lazy upload, reuse/eviction, suspension, offscreen culling, finale
visibility and settling. It uses mocked DOM/GL resources, not a device GPU.

## Physical-device matrix (pending)

Use the production site and an unmodified baseline build for before/after runs.
Do not call desktop viewport emulation a phone measurement.

| Device class | Browser | Before | After |
| --- | --- | --- | --- |
| iPhone SE (2nd/3rd generation) | Safari | Not run | Not run |
| Samsung Galaxy A54 or similar midrange Android | Chrome | Not run | Not run |
| Pixel 6a or similar | Chrome | Not run | Not run |

For each device, record OS/browser version, CSS viewport, DPR, battery/charging
state and whether the device is warm. Use the same network conditions and repeat
three cold-load and three warm-load runs, alternating before/after order.

1. Load at the hero. Confirm no gallery texture uploads before the proximity gate.
2. Scroll through all cards and reverse direction several times for 30 seconds.
   Record the browser performance timeline and frame pacing, long tasks and
   interaction delay; check image quality and the transparent finale.
3. Stop on a card for 10 seconds. Gallery frame submissions should stop after
   settling; the separate fog/hero effects may still have their own work.
4. Scroll past the stage, background the tab for 10 seconds, then return.
   Texture count should become zero on suspension and recover without blank cards
   or a context-loss error. Test orientation change and restored/deep-link scroll.
5. Repeat with reduced motion and with WebGL unavailable. Verify static project
   links, keyboard navigation and the canvas fallback.

### Optional local diagnostics

Open `https://www.zelunhe.com/?gallery-profile=1`, scroll through the gallery, and
read in the device's remote console:

```js
const stage = document.querySelector('.gallery-stage');
JSON.parse(stage.dataset.galleryProfile || '{}');
const canvas = stage.querySelector('.gallery-canvas');
({
  textureCount: Number(canvas.dataset.textureCount || 0),
  textureEstimateBytes: Number(canvas.dataset.textureEstimateBytes || 0)
});
```

The opt-in profile keeps the latest 300 JavaScript submission samples, P50/P95,
render count and buffer dimensions in the DOM. No results are transmitted or
persisted. WebGL submission duration is **CPU command-submission time, not GPU
completion time**. Canvas fallback submission time does not include its worker's
paint time; inspect the worker canvas's existing `data-paint-ms` separately.
Use a browser/device trace for frame pacing; use platform GPU tools where
available for GPU timing and memory evidence.

Fill in measured results before claiming a phone-performance improvement.
