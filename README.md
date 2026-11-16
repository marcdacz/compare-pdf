<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/833px-PDF_file_icon.svg.png" height="128" alt="Adobe PDF">

# compare-pdf

Standalone node module that compares pdfs

From version 2.0.0 this package is now pure ESM. It cannot be require()'d from CommonJS.

You also need to make sure you're on a supported Node.js release. At minimum Node.js 24.20.0.

I would strongly recommend moving to ESM. ESM can still import CommonJS packages, but CommonJS packages cannot import ESM packages synchronously.

## Setup

To use the GraphicsMagick/ImageMagick engine options, install the following system dependencies

- [GraphicsMagick](http://www.graphicsmagick.org/README.html)
- [ImageMagick >=7](https://imagemagick.org/script/download.php)
- [GhostScript](https://www.ghostscript.com/download.html)

```sh
brew install graphicsmagick
brew install imagemagick
brew install ghostscript
```

Install npm module

```sh
npm install compare-pdf
```

The package invokes the `gm` or `magick` binaries directly, so those tools still need to be available on the system PATH.

## Default Configuration

Below is the default configuration showing the paths where the PDFs should be placed. By default, they are in the root folder of your project inside the folder data.

The config also contains settings for image comparison such as density, quality, tolerance and threshold. It also has flag to enable or disable cleaning up of the actual and baseline png folders.

```javascript
import { Engine, LogLevel } from "compare-pdf";

export default {
	"paths": {
		"actualPdfRootFolder": "./data/actualPdfs",
		"baselinePdfRootFolder": "./data/baselinePdfs",
		"actualPngRootFolder": "./data/actualPngs",
		"baselinePngRootFolder": "./data/baselinePngs",
		"diffPngRootFolder": "./data/diffPngs"
	},
	"settings": {
		"imageEngine": Engine.GRAPHICS_MAGICK,
		"density": 100,
		"quality": 70,
		"tolerance": 0,
		"threshold": 0.05,
		"cleanPngPaths": true,
		"matchPageCount": true,
		"disableFontFace": true,
		"verbosity": LogLevel.ERROR,
		"password": undefined
	}
};
```

### Settings:

**PDF to Image Conversion**

- **imageEngine**: This config allows you to specify which image engine to use, set by Engine enum [Engine.NATIVE | Engine.GRAPHICS_MAGICK | Engine.IMAGE_MAGICK ] default is Engine.NATIVE
- **density**: This option specifies the image resolution to store while encoding a raster image or the canvas resolution while rendering (reading) vector formats into an image for the GraphicsMagick/ImageMagick CLI engines.
- **quality**: Adjusts the jpeg|miff|png|tiff compression level used by the GraphicsMagick/ImageMagick CLI engines. val ranges from 0 to 100 (best).
- **cleanPngPaths**: This is a boolean flag for cleaning png folders automatically
- **matchPageCount**: This is a boolean flag that enables or disables the page count verification between the actual and baseline PDFs
- **disableFontFace**: By default fonts are converted to OpenType fonts and loaded via the Font Loading API or `@font-face` rules. If disabled, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands.
- **verbosity**: Controls the logging level for pdfjsLib, set by LogLevel enum  [LogLevel.ERROR | LogLevel.WARNING, LogLevel.INFO ] default IS LogLevel.ERROR
- **password**: Optional setting to supply a password for a password protected or restricted PDF

**Image Comparison**

- **tolerance**: This is the allowable pixel count that is different between the compared images.
- **threshold**: (from pixelmatch) Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive. 0.05 by default.

## Compare PDF's By Image

### Basic Usage

By default, PDFs are compared using the comparison enum type CompareBy [CompareBy.IMAGE | CompareBy.BASE64], default is CompareBy.IMAGE

```javascript
import ComparePdf, { CompareBy } from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

const comparePdf = new ComparePdf();

it("Should be able to verify same PDFs", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("same.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare();

	chai.expect(results.status).to.equal("passed");
});

it("Should be able to verify different PDFs", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("notSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare(CompareBy.IMAGE);

	chai.expect(results.status).to.equal("failed");
	chai.expect(results.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
	chai.expect(results.details).to.not.be.null;
});
```

### Using Masks

You can mask areas of the images that has dynamic values (i.e. Dates, or Ids) before the comparison. Just use the addMask method and indicate the pageIndex (starts at 0) and the coordinates.

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify same PDFs with Masks", async () => {
	const comparePdf = new ComparePdf();
	const results = await comparePdf
		.init()
		.actualPdfFile("maskedSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.addMask(1, { x0: 35, y0: 70, x1: 145, y1: 95 })
		.addMask(1, { x0: 185, y0: 70, x1: 285, y1: 95 })
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

You can also indicate the page masks in bulk by passing an array of it in the addMasks method

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify different PDFs with Masks", async () => {
	const comparePdf = new ComparePdf();
	const masks = [
		{ pageIndex: 1, coordinates: { x0: 35, y0: 70, x1: 145, y1: 95 } },
		{ pageIndex: 1, coordinates: { x0: 185, y0: 70, x1: 285, y1: 95 } }
	];
	const results = await comparePdf
		.init()
		.actualPdfFile("maskedNotSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.addMasks(masks)
		.compare();

	chai.expect(results.status).to.equal("failed");
	chai.expect(results.message).to.equal("maskedNotSame.pdf is not the same as baseline.pdf.");
	chai.expect(results.details).to.not.be.null;
});
```

### Cropping Pages

If you need to compare only a certain area of the PDF, you can do so by utilising the cropPage method and passing the pageIndex (starts at 0), the width and height along with the x and y coordinates.

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify same PDFs with Croppings", async () => {
	const comparePdf = new ComparePdf();
	const results = await comparePdf
		.init()
		.actualPdfFile("same.pdf")
		.baselinePdfFile("baseline.pdf")
		.cropPage(1, { width: 530, height: 210, x: 0, y: 415 })
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

Similar to masks, you can also pass all cropping in bulk into the cropPages method. You can have multiple cropping's in the same page.

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify same PDFs with Croppings", async () => {
	const croppings = [
		{ pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 265 } },
		{ pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 520 } },
		{ pageIndex: 1, coordinates: { width: 530, height: 210, x: 0, y: 415 } }
	];

	const comparePdf = new ComparePdf();
	const results = await comparePdf
		.init()
		.actualPdfFile("same.pdf")
		.baselinePdfFile("baseline.pdf")
		.cropPages(croppings)
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

### Verify Specific Page Indexes

Should you need to test only specific page indexes in a PDF, you can do so by specifying an array of page indexes using the onlyPageIndexes method as shown below.

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify only specific page indexes", async () => {
	const comparePdf = new ComparePdf();
	const results = await comparePdf
		.init()
		.actualPdfFile("notSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.onlyPageIndexes([1])
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

### Skip Specific Page Indexes

On the flip side, should you need to skip specific page indexes in a PDF, you can do so by specifying an array of page indexes using the skipPageIndexes method as shown below.

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to skip specific page indexes", async () => {
	const comparePdf = new ComparePdf();
	const results = await comparePdf
		.init()
		.actualPdfFile("notSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.skipPageIndexes([0])
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

### Using buffers

Starting from v1.1.6, we now support passing buffers instead of the filepath. This is very useful for situations where PDF's comes from an API call.

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";
import * as fs from "node:fs";

const comparePdf = new ComparePdf();

it("Should be able to verify same PDFs using direct buffer", async () => {
	const actualPdfFilename = "same.pdf";
	const baselinePdfFilename = "baseline.pdf";
	const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
	const baselinePdfBuffer = fs.readFileSync(`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

	const results = await comparePdf
		.init()
		.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
		.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
		.compare();

	chai.expect(results.status).to.equal("passed");
});

it("Should be able to verify same PDFs using direct buffer passing filename in another way", async () => {
	const actualPdfFilename = "same.pdf";
	const baselinePdfFilename = "baseline.pdf";
	const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
	const baselinePdfBuffer = fs.readFileSync(`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

	const results = await comparePdf
		.init()
		.actualPdfBuffer(actualPdfBuffer)
		.actualPdfFile(actualPdfFilename)
		.baselinePdfBuffer(baselinePdfBuffer)
		.baselinePdfFile(baselinePdfFilename)
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

## Compare PDF's By Base64

### Basic Usage

By passing "byBase64" as the comparison type parameter in the compare method, the PDFs will be compared whether the actual and baseline's converted file in base64 format are the same.

```javascript
import ComparePdf, { CompareBy } from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

const comparePdf = new ComparePdf();

it("Should be able to verify same PDFs", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("same.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare(CompareBy.BASE64);

	chai.expect(results.status).to.equal("passed");
});

it("Should be able to verify different PDFs", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("notSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare(CompareBy.BASE64);

	chai.expect(results.status).to.equal("failed");
	chai.expect(results.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
});
```

You can also directly pass buffers instead of filepath's

```javascript
import ComparePdf, { CompareBy } from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";
import * as fs from "node:fs";

it("Should be able to verify same PDFs using direct buffer", async () => {
	const comparePdf = new ComparePdf();
	const actualPdfFilename = "same.pdf";
	const baselinePdfFilename = "baseline.pdf";
	const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
	const baselinePdfBuffer = fs.readFileSync(`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

	const results = await comparePdf
		.init()
		.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
		.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
		.compare(CompareBy.BASE64);

	chai.expect(results.status).to.equal("passed");
});
```

## Other Capabilities

### Overriding Default Configuration

Users can override the default configuration by passing their custom config when initialising the class

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to override default configs", async () => {
	const config = {
		"paths": {
			"actualPdfRootFolder": process.cwd() + "/data/newActualPdfs",
			"baselinePdfRootFolder": process.cwd() + "/data/baselinePdfs",
			"actualPngRootFolder": process.cwd() + "/data/actualPngs",
			"baselinePngRootFolder": process.cwd() + "/data/baselinePngs",
			"diffPngRootFolder": process.cwd() + "/data/diffPngs"
		},
		"settings": {
			"density": 100,
			"quality": 70,
			"tolerance": 0,
			"threshold": 0.05,
			"cleanPngPaths": false,
			"matchPageCount": true
		}
	};
	const comparePdf = new ComparePdf(config);
	const results = await comparePdf
		.init()
		.actualPdfFile("newSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare();

	chai.expect(results.status).to.equal("passed");
});

it("Should be able to override specific config property", async () => {
	const comparePdf = new ComparePdf();
	comparePdf.config.paths.actualPdfRootFolder = process.cwd() + "/data/newActualPdfs";
	const results = await comparePdf
		.init()
		.actualPdfFile("newSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

### Pdf File Paths

Users can pass just the filename with or without extension as long as the PDFs are inside the default or custom configured actual and baseline paths

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

const comparePdf = new ComparePdf();

it("Should be able to pass just the name of the PDF with extension", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("same.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare();

	chai.expect(results.status).to.equal("passed");
});

it("Should be able to pass just the name of the PDF without extension", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("same")
		.baselinePdfFile("baseline")
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

Users can also pass a relative path of the PDF files as parameters

```javascript
import ComparePdf from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify same PDFs using relative paths", async () => {
	const comparePdf = new ComparePdf();

	const results = await comparePdf
		.init()
		.actualPdfFile("../data/actualPdfs/same.pdf")
		.baselinePdfFile("../data/baselinePdfs/baseline.pdf")
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

Users can also switch the engine from one of the following options:
- imageMagick
- graphicsMagick

and the logging/verbosity level from default ERROR level:

| Logging/Verbosity Level | Value |
|-------------------------|-------|
| LogLevel.INFO           | 5     |
| LogLevel.WARNING        | 1     |
| LogLevel.ERROR          | 0     |

```javascript
import ComparePdf, { Engine, LogLevel } from "compare-pdf";
import { it } from "mocha";
import * as chai from "chai";

it("Should be able to verify same PDFs using relative paths", async () => {
	const comparePdf = new ComparePdf({ settings: {	imageEngine: Engine.GRAPHICS_MAGICK, verbosity: LogLevel.WARNING }});

	const results = await comparePdf
		.init()
		.actualPdfFile("../data/actualPdfs/same.pdf")
		.baselinePdfFile("../data/baselinePdfs/baseline.pdf")
		.compare();

	chai.expect(results.status).to.equal("passed");
});
```

## Tips and Tricks

### Speed up your tests

To speed up your test executions, you can utilise the comparison type "byBase64" first and only when it fails you compare it "byImage". This provides the best of both worlds where you get the speed of execution and when there is a difference, you can check the image diff.

```javascript
import ComparePdf, { CompareBy } from "compare-pdf";
import {it} from "mocha";
import * as chai from "chai";

const comparePdf = new ComparePdf();

it("Should be able to verify PDFs byBase64 and when it fails then byImage", async () => {
	const results = await comparePdf
		.init()
		.actualPdfFile("notSame.pdf")
		.baselinePdfFile("baseline.pdf")
		.compare(CompareBy.BASE64);

	chai.expect(results.status).to.equal("failed");
	chai.expect(results.message).to.equal("notSame.pdf is not the same as baseline.pdf compared by their base64 values.");

	if (results.status === "failed") {
		const results = await comparePdf
			.init()
			.actualPdfFile("notSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare(CompareBy.IMAGE);

		chai.expect(results.status).to.equal("failed");
		chai.expect(results.message).to.equal("notSame.pdf is not the same as baseline.pdf compared by their images.");
		chai.expect(results.details).to.not.be.null;
	}
});
```

### Library not loaded error

macOS users encountering "dyld: Library not loaded" error? Then follow the answer from this [stackoverflow post](https://stackoverflow.com/questions/55754551/how-to-install-imagemagick-portably-on-macos-when-i-cant-set-dyld-library-path) to set the correct path to \*.dylib.

### Using Apple Silicon

If you have issues running the app using Apple Silicon, be sure to install the following:

```sh
brew install pkg-config cairo pango
brew install libpng jpeg giflib librsvg
```

## Example Projects

- [Using Mocha + Chai](/examples/mocha)
- [Using Cypress](/examples/cypress)
