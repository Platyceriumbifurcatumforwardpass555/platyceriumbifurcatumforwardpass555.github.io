# BTO Layout Studio

A lightweight browser-based 2D/Three.js planning tool for a Singapore 5-room BTO.

## Run locally

Serve the repository with any static web server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a normal desktop browser. Do not use an embedded HTML preview for sustained WebGL work.

## Current features

- Millimetre-based structured project data
- PNG/JPG/WebP basemap upload, calibration, ratio lock, crop and offsets
- Browser-side Tesseract.js dimension suggestions (online connection required to load OCR assets)
- Editable beta wall detection and wall-to-basemap alignment
- Direct wall manipulation: drag body to move, endpoints to resize, green handle to rotate
- Doors and windows with labels
- Furniture, Carpentry and Decorative catalogues
- Wardrobes, kitchen upper/lower cabinets, worktops and settees
- Glass-block screens and adjustable S/M potted plants
- Larger label text with red occlusion state and no text outline
- Optional adjustable ceiling, defaulting to 2,600 mm
- Collision and clearance warnings
- Camera controls and PNG export
- Project JSON save/load
- Undo/redo and right-click deselection

## OCR

OCR runs in the browser through Tesseract.js. The plan image is processed on the user's device. OCR values are suggestions only and must be confirmed before basemap scaling or wall alignment.

## Hosting

The app is static and can be hosted with GitHub Pages. In repository **Settings → Pages**, publish from the `main` branch and root folder.

## Notes

The authoritative model is the JSON project data in millimetres. SVG or raster plans are visual references and are not used as authoritative furniture coordinates.
