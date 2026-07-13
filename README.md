# BTO Layout Studio v2.7

A lightweight browser-based 2D/Three.js planning tool for Singapore BTO layouts. The authoritative model is structured project data in millimetres.

## Run

Host the repository as a static site, or run locally with:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in a normal desktop browser.

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

Use the files in `gpt/` as the custom GPT's instructions and knowledge. The GPT should output a schema-valid `project.json` after architectural and layout review. Load that JSON directly, or place it with the basemap and references into a `.btozip` package.

## Browser dependencies

- Three.js for 3D
- Tesseract.js for optional in-browser OCR
- JSZip for project-package import/export

No OCR service API is required.
