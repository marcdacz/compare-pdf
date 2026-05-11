# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all JS tests (both engines)
npm test

# Run all TypeScript tests
npm run test-ts

# Run a single test file
./node_modules/mocha/bin/mocha test/comparePdfTests.js --timeout 600000

# Run tests matching a pattern
./node_modules/mocha/bin/mocha test/comparePdfTests.js --timeout 600000 --grep "Should be able to verify same single page PDFs"
```

Tests require GraphicsMagick, ImageMagick, and GhostScript installed on the system for the `graphicsMagick` engine. The `native` engine has no system dependencies.

## Architecture

This is a published npm library (`compare-pdf`) with a fluent builder API for visual PDF regression testing. There is no build step — source ships as CommonJS JS with a separate handwritten TypeScript declaration file.

### Comparison pipeline (`byImage`)

`ComparePdf` (builder) → `compareImages.comparePdfByImage` → image engine → `comparePngs` (pixelmatch)

1. Both PDFs are converted to per-page PNGs into temp subdirectories under `data/actualPngs/` and `data/baselinePngs/`.
2. Masks (filled rectangles) and crops are applied to the PNGs in-place before comparison.
3. `pixelmatch` compares each PNG pair; diffs are written to `data/diffPngs/`.
4. Temp PNG dirs are deleted if `cleanPngPaths: true` (default).

### Image engines

Both engines export the same three functions — `pdfToPng`, `applyMask`, `applyCrop` — and are swapped at runtime based on `config.settings.imageEngine`:

- **`graphicsMagick`** (default): shells out to `convert` (Unix) / `magick` (Windows) via the `gm` package. Requires system dependencies.
- **`native`**: pure JS using `pdfjs-dist` + `canvas`. No system deps. Hardcodes scale `1.38889` (≈100 DPI equivalent). CMAP/font paths are relative to the engine file location.

### Mask vs Crop coordinates

- **Mask** uses `{ x0, y0, x1, y1 }` — two corner points (top-left, bottom-right).
- **Crop** uses `{ width, height, x, y }` — origin + dimensions. Crops produce new files suffixed `-{cropIndex}.png` and the original page PNG is no longer compared.

### Error handling pattern

Builder methods validate inputs and set `this.result = { status: 'failed', message }` on bad input. `compare()` short-circuits if `result.status === 'failed'` before calling any engine. All comparison functions return `{ status, message, details? }` — they never throw to the caller.

### TypeScript declarations

`types/comparePdf.d.ts` is maintained by hand. It is not generated from the JS source. When adding or changing the public API, update the `.d.ts` and `tsconfig.json` together.

### Test conventions

Tests iterate over both engines in a `for...of` loop with nested `describe`. Each test does `beforeEach(() => { config = require('./config'); config.settings.imageEngine = engine; })` — note `delete require.cache` is needed to get a fresh config object each time. Test PDFs live in `data/actualPdfs/` and `data/baselinePdfs/`.

## Development Conventions

### Commit convention

One commit per completed task. Every commit must be lint-clean and test-green before it lands. The pre-commit hook enforces this automatically.

### Quality gates

```bash
# Lint (must pass before committing)
npm run lint

# JS tests
npm test

# TypeScript declaration tests
npm run test-ts
```

### Pre-commit hook

`.git/hooks/pre-commit` runs `npm run lint && npm test` on every commit. It is a plain shell script (no husky). Re-create it after a fresh clone:

```sh
cp .git/hooks/pre-commit.sample .git/hooks/pre-commit  # then replace content
chmod +x .git/hooks/pre-commit
```
