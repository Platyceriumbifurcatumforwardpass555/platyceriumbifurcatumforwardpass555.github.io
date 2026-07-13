# BTO Layout Studio v2.7

A lightweight browser-based 2D/Three.js planning tool for Singapore BTO layouts. The authoritative model is structured project data in millimetres.

## Run

Host the repository as a static site, or run locally with:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in a normal desktop browser.

## Current catalogue update

- Added TV console under Carpentry
- Added custom decorative models for TV, framed picture, bowl of fruits, handphone and water flask
- Added adjustable object elevation in millimetres for tabletop, console-top and wall-mounted objects
- Furniture-to-furniture collision checks now account for vertical separation, so an object can sit on a support surface without being treated as a volume overlap

## Project packages

The app can import and export `.btozip` project packages containing:

- `manifest.json`
- `project.json`
- `project-notes.json`
- the calibrated basemap under `assets/`
- reference images under `references/`

The package is a normal ZIP archive with a different extension. JSON project data remains the authoritative source; images are references.

## Hosted project library

Add package entries to `projects/index.json`. Each entry uses:

```json
{
  "id": "example-project",
  "name": "Example project",
  "description": "Optional description",
  "package": "example-project/example-project.btozip"
}
```

The package path is resolved relative to `projects/index.json`.

## Custom GPT handoff

Use these files from `gpt/`:

- `BTO-Layout-Planner-Instructions.md` — paste into the GPT Instructions field
- `BTO-Layout-Object-Catalog.md` — upload as a Knowledge file

Also upload `schema/project-schema.md` as Knowledge. The GPT should output schema-valid `project.json` after architectural and layout review. Load that JSON directly, or place it with the basemap and references into a `.btozip` package.

## Browser dependencies

- Three.js for 3D
- Tesseract.js for optional in-browser OCR
- JSZip for project-package import/export

No OCR service API is required.
