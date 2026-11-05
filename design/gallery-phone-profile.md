# Gallery resource audit and phone profiling

Status: resource changes implemented; **physical-device profiling has not been run**.
On November 5, 2026, the resource suite and a new lifecycle/geometry suite were
run in Node.js v24.22.1. A remote desktop Chrome session was also inspected.
No physical iPhone, Android, mobile Safari, or device farm was available.
These checks are not measurements of phone frame rate, GPU completion time,
thermal behavior, battery use, or device memory.

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


## November 5, 2026 validation record

Tested application revision: `a8e4e7b6f488d3e617eeaa6ee18ffc6a9d22234a`.
This record leaves the site's appearance and resource policy unchanged.

### Executed checks

| Check | Environment | Result | Limit |
| --- | --- | --- | --- |
| Existing resource suite | Node.js v24.22.1; mocked images, canvases and GL calls | 30 assertions passed | No real decoding, allocation, driver or GPU timing |
| Lifecycle and projection suite | Node.js v24.22.1; controlled DOM/event/renderer boundaries | 80 checks passed | Not browser layout, compositing, touch input or device orientation |
| Live Work navigation and gallery rendering | Remote desktop Chrome, 1348 × 936 CSS viewport | Work link reached the gallery; cards and finale checkpoint rendered using Canvas mesh | Desktop fallback observation only; no phone or WebGL quality pass |
| Real iPhone Safari | No hardware connection | **Not run** | All phone acceptance items remain pending |
| Real midrange Android Chrome | No hardware connection | **Not run** | All phone acceptance items remain pending |

The lifecycle suite exercises selection across all six cards and reverse scrolling,
resizing between portrait and landscape stage dimensions, offscreen/hidden
suspension and return, context-loss replacement with Canvas, failure of that
replacement, renderer-error disposal, initial reduced motion, runtime reduced
motion, and final handoff/reversal. Context loss and recovery are **synthetic
events with mocked renderers**, not actual GPU context loss.

Run the added suite from the repository root:

```sh
node scripts/test-gallery-lifecycle.mjs
```

The live Chrome session selected `canvas-mesh`; the cause of WebGL rejection was
not established. Its submission counter stopped changing when idle. This is a
limited functional observation, not a frame-pacing measurement. The opt-in CPU
submission durations are intentionally not reported as a phone-performance result.
The WebGL canvas's default 300 × 150 buffer dimensions in the diagnostic payload
also do **not** describe the active worker Canvas fallback's backing buffer.

### Final-expansion sharpness: not yet accepted on phones

The last card is `portfolio-next-chapter.svg`, not a project screenshot.
During its animation, it is rasterized through the capped source surface and
renderer buffer. At completed handoff, the canvas is hidden and a native
`<img class="gallery-end-panel">` displays that SVG at 90.5% of the stage width.
The settled SVG therefore bypasses the gallery's 1024px texture cap. This is
established from source and the loaded image's DOM metadata; final phone
legibility has not been visually verified.

The controlled projection tests cover 320/375/390/360/412px portrait widths and
their landscape counterparts. The expanded frame stays horizontally within the
stage and approximates the 90.5% width convention within 0.1 percentage point.
This verifies projection math, not rendered browser pixels.

| Example CSS viewport | Stage height from current CSS minimum | Final panel width, approximately | Finale text size from SVG scale, approximately |
| --- | ---: | ---: | ---: |
| 375 × 667 | 700px | 339px | 17.6px |
| 390 × 844 | 844px | 353px | 18.3px |
| 360 × 800 | 800px | 326px | 16.9px |
| 412 × 915 | 915px | 373px | 19.3px |
| 844 × 390 | 660px | 764px | 39.5px |
| 915 × 412 | 660px | 828px | 42.9px |

Open quality risks, rather than observed phone failures:

- At DPR 3, the animated renderer's DPR 1.5 budget supplies half the native pixel
  density in each axis. On-device screenshots must decide whether this is
  acceptably sharp; the budget alone cannot establish legibility.
- At 844px landscape width, the final animated panel occupies roughly 1146
  backing-buffer pixels horizontally at density 1.5, exceeding its 1024px source
  surface. Modest upscaling is expected. The final native SVG is a separate path.
- The 2048 × 1357 finale becomes a 1024 × 679 CPU surface, then normally a
  1024 × 512 power-of-two GL texture. This extra vertical resampling can affect
  text during animation. The current mock tests do not inspect raster quality.
- A 320px-wide phone scales the SVG's 106-unit text to about 15 CSS pixels.
- Landscape stages retain a 660px or 740px minimum height, greater than ordinary
  landscape phone viewports. For example, the 844px-wide panel is about 506px
  tall in a 390px-high viewport. Horizontal bounds passing does not establish
  that the entire finale, readout and controls fit onscreen. Inspect rotation
  mid-card and during expansion before accepting the layout.

### Required phone acceptance capture

Use one available ordinary iPhone (for example SE 2022 or iPhone 12/13) in Safari
and one midrange Android (for example Galaxy A54) in Chrome. Record the exact
model, OS/browser versions, CSS viewport, DPR, battery/charging state and warmth.
Do not substitute a desktop browser with a mobile user agent.

For each phone, complete the cold/warm and reverse-scroll procedure above.
Additionally:

1. Capture native OS screenshots while stopped on Scribsy, the detailed symposium
   poster, Narrator, near-full expansion and the settled SVG. Judge small screenshot
   text separately from the large finale message. A screen recording alone is
   insufficient for sharpness because it may be recompressed.
2. Rotate portrait → landscape → portrait on a middle card, mid-expansion and
   after handoff. Check current project selection, links, blank/cropped cards,
   readout visibility, available screen height and transition alignment.
3. Enable the OS reduced-motion preference before loading, then change it while
   the gallery is active. Confirm the static project entries and all links remain
   available and the gallery stops submitting frames.
4. Background/foreground the browser, leave/reenter the gallery and, with remote
   debugging where supported, deliberately lose the WebGL context. Verify
   Canvas fallback or usable static content, with no permanent blank state.
5. Collect a device/browser performance trace for each repeated scroll run.
   Report frame intervals/missed frames and long tasks separately from JS
   submission time. Report measured memory only if the chosen platform tool
   exposes it reliably; otherwise retain the allocation estimates as estimates.

For now the phone matrix, phone screenshot-quality decision, actual orientation
behavior, real reduced-motion behavior, and GPU recovery/performance results are
all **pending physical-device testing**.
