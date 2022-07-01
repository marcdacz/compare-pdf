<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/833px-PDF_file_icon.svg.png" height="128">

# compare-pdf

Standalone node module that compares pdfs

## Setup

To use GraphicsMagick (gm) Engine, install the following system dependencies

On MS Windows, please use the 32bit version of GhostScript

-   [GraphicsMagick](http://www.graphicsmagick.org/README.html)
-   [ImageMagick](https://imagemagick.org/script/download.php)
-   [GhostScript](https://www.ghostscript.com/download.html)

```
brew install graphicsmagick
brew install imagemagick
brew install ghostscript
```

Install npm module

```
npm install compare-pdf
```

## Default Configuration

Below is the default configuration showing the paths where the pdfs should be placed. By default, they are in the root folder of your project inside the folder data.

The config also contains settings for image comparison such as density, quality, tolerance and threshold. It also has flag to enable or disable cleaning up of the actual and baseline png folders.

```
{
    paths: {
        actualPdfRootFolder: process.cwd() + "/data/actualPdfs",
        baselinePdfRootFolder: process.cwd() + "/data/baselinePdfs",
        actualPngRootFolder: process.cwd() + "/data/actualPngs",
        baselinePngRootFolder: process.cwd() + "/data/baselinePngs",
        diffPngRootFolder: process.cwd() + "/data/diffPngs"
    },
    settings: {
        imageEngine: 'graphicsMagick',
        density: 100,
        quality: 70,
        tolerance: 0,
        threshold: 0.05,
        cleanPngPaths: true,
        matchPageCount: true,
        disableFontFace: true,
	    verbosity: 0
    }
}
```

### Settings:

**PDF to Image Conversion**
-   **imageEngine**: (experimental) This config allows you to specify which image engine to use: graphicsMagick or native
-   **density**: (from gm) This option specifies the image resolution to store while encoding a raster image or the canvas resolution while rendering (reading) vector formats into an image.
-   **quality**: (from gm) Adjusts the jpeg|miff|png|tiff compression level. val ranges from 0 to 100 (best).
-   **cleanPngPaths**: This is a boolean flag for cleaning png folders automatically
-   **matchPageCount**: This is a boolean flag that enables or disables the page count verification between the actual and baseline pdfs
-   **disableFontFace**: By default fonts are converted to OpenType fonts and loaded via the Font Loading API or `@font-face` rules. If disabled, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands.
-   **verbosity**: Controls the logging level for pdfjsLib (0: Errors (default), 1: Warning, 5: Infos)


**Image Comparison**

-   **tolerance**: This is the allowable pixel count that is different between the compared images.
-   **threshold**: (from pixelmatch) Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive. 0.05 by default.

## Compare Pdfs By Image

### Basic Usage

By default, pdfs are compared using the comparison type as "byImage"

```
it("Should be able to verify same PDFs", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("same.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});

it("Should be able to verify different PDFs", async () => {
    const ComparePdf = new comparePdf();
    let comparisonResults = await ComparePdf.actualPdfFile("notSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare("byImage");
    expect(comparisonResults.status).to.equal("failed");
    expect(comparisonResults.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
    expect(comparisonResults.details).to.not.be.null;
});
```

### Using Masks

You can mask areas of the images that has dynamic values (ie. Dates, or Ids) before the comparison. Just use the addMask method and indicate the pageIndex (starts at 0) and the coordinates.

```
it("Should be able to verify same PDFs with Masks", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("maskedSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .addMask(1, { x0: 35, y0: 70, x1: 145, y1: 95 })
        .addMask(1, { x0: 185, y0: 70, x1: 285, y1: 95 })
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

You can also indicate the page masks in bulk by passing an array of it in the addMasks method

```
it("Should be able to verify different PDFs with Masks", async () => {
    const ComparePdf = new comparePdf();
    let masks = [
        { pageIndex: 1, coordinates: { x0: 35, y0: 70, x1: 145, y1: 95 } },
        { pageIndex: 1, coordinates: { x0: 185, y0: 70, x1: 285, y1: 95 } }
    ];
    let comparisonResults = await ComparePdf.actualPdfFile("maskedNotSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .addMasks(masks)
        .compare();
    expect(comparisonResults.status).to.equal("failed");
    expect(comparisonResults.message).to.equal("maskedNotSame.pdf is not the same as baseline.pdf.");
    expect(comparisonResults.details).to.not.be.null;
});
```

### Cropping Pages

If you need to compare only a certain area of the pdf, you can do so by utilising the cropPage method and passing the pageIndex (starts at 0), the width and height along with the x and y coordinates.

```
it("Should be able to verify same PDFs with Croppings", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("same.pdf")
        .baselinePdfFile("baseline.pdf")
        .cropPage(1, { width: 530, height: 210, x: 0, y: 415 })
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

Similar to masks, you can also pass all cropping in bulk into the cropPages method. You can have multiple croppings in the same page.

```
it("Should be able to verify same PDFs with Croppings", async () => {
    let croppings = [
        { pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 265 } },
        { pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 520 } },
        { pageIndex: 1, coordinates: { width: 530, height: 210, x: 0, y: 415 } }
    ];

    let comparisonResults = await new comparePdf()
        .actualPdfFile("same.pdf")
        .baselinePdfFile("baseline.pdf")
        .cropPages(croppings)
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

### Verify Specific Page Indexes

Should you need to test only specific page indexes in a pdf, you can do so by specifying an array of page indexes using the onlyPageIndexes method as shown below.

```
it("Should be able to verify only specific page indexes", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("notSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .onlyPageIndexes([1])
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

### Skip Specific Page Indexes

On the flip side, should you need to skip specific page indexes in a pdf, you can do so by specifying an array of page indexes using the skipPageIndexes method as shown below.

```
it("Should be able to skip specific page indexes", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("notSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .skipPageIndexes([0])
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

### Using buffers
Starting from v1.1.6, we now support passing buffers instead of the filepath. This is very useful for situations where Pdfs comes from an API call.

```
it('Should be able to verify same PDFs using direct buffer', async () => {
    const actualPdfFilename = "same.pdf";
    const baselinePdfFilename = "baseline.pdf";
    const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
    const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

    let comparisonResults = await new comparePdf()
        .actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
        .baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
        .compare();
    expect(comparisonResults.status).to.equal('passed');
});

it('Should be able to verify same PDFs using direct buffer passing filename in another way', async () => {
    const actualPdfFilename = "same.pdf";
    const baselinePdfFilename = "baseline.pdf";
    const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
    const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

    let comparisonResults = await new comparePdf()
        .actualPdfBuffer(actualPdfBuffer)
        .actualPdfFile(actualPdfFilename)
        .baselinePdfBuffer(baselinePdfBuffer)
        .baselinePdfFile(baselinePdfFilename)
        .compare();
    expect(comparisonResults.status).to.equal('passed');
});
```

## Compare Pdfs By Base64

### Basic Usage

By passing "byBase64" as the comparison type parameter in the compare method, the pdfs will be compared whether the actual and baseline's converted file in base64 format are the same.

```
it("Should be able to verify same PDFs", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("same.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare("byBase64");
    expect(comparisonResults.status).to.equal("passed");
});

it("Should be able to verify different PDFs", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("notSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare("byBase64");
    expect(comparisonResults.status).to.equal("failed");
    expect(comparisonResults.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
});
```

You can also directly pass buffers instead of filepaths

```
it('Should be able to verify same PDFs using direct buffer', async () => {
    const actualPdfFilename = "same.pdf";
    const baselinePdfFilename = "baseline.pdf";
    const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
    const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

    let comparisonResults = await new comparePdf(config)
        .actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
        .baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
        .compare('byBase64');
    expect(comparisonResults.status).to.equal('passed');
});
```

## Other Capabilities

### Overriding Default Configuration

Users can override the default configuration by passing their custom config when initialising the class

```
it("Should be able to override default configs", async () => {
    let config = {
        paths: {
            actualPdfRootFolder: process.cwd() + "/data/newActualPdfs",
            baselinePdfRootFolder: process.cwd() + "/data/baselinePdfs",
            actualPngRootFolder: process.cwd() + "/data/actualPngs",
            baselinePngRootFolder: process.cwd() + "/data/baselinePngs",
            diffPngRootFolder: process.cwd() + "/data/diffPngs"
        },
        settings: {
            density: 100,
            quality: 70,
            tolerance: 0,
            threshold: 0.05,
            cleanPngPaths: false,
            matchPageCount: true
    };
    let comparisonResults = await new comparePdf(config)
        .actualPdfFile("newSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});

it("Should be able to override specific config property", async () => {
    const ComparePdf = new comparePdf();
    ComparePdf.config.paths.actualPdfRootFolder = process.cwd() + "/data/newActualPdfs";
    let comparisonResults = await ComparePdf.actualPdfFile("newSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

### Pdf File Paths

Users can pass just the filename with or without extension as long as the pdfs are inside the default or custom configured actual and baseline paths

```
it("Should be able to pass just the name of the pdf with extension", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("same.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});

it("Should be able to pass just the name of the pdf without extension", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("same")
        .baselinePdfFile("baseline")
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

Users can also pass a relative path of the pdf files as parameters

```
it("Should be able to verify same PDFs using relative paths", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("../data/actualPdfs/same.pdf")
        .baselinePdfFile("../data/baselinePdfs/baseline.pdf")
        .compare();
    expect(comparisonResults.status).to.equal("passed");
});
```

## Tips and Tricks

### Speed up your tests

To speed up your test executions, you can utilise the comparison type "byBase64" first and only when it fails you comapre it "byImage". This provides the best of both worlds where you get the speed of execution and when there is a difference, you can check the image diff.

```
it("Should be able to verify PDFs byBase64 and when it fails then byImage", async () => {
    let comparisonResultsByBase64 = await new comparePdf()
        .actualPdfFile("notSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare("byBase64");
    expect(comparisonResultsByBase64.status).to.equal("failed");
    expect(comparisonResultsByBase64.message).to.equal(
        "notSame.pdf is not the same as baseline.pdf compared by their base64 values."
    );

    if (comparisonResultsByBase64.status === "failed") {
        let comparisonResultsByImage = await new comparePdf()
            .actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare("byImage");
        expect(comparisonResultsByImage.status).to.equal("failed");
        expect(comparisonResultsByImage.message).to.equal(
            "notSame.pdf is not the same as baseline.pdf compared by their images."
        );
        expect(comparisonResultsByImage.details).to.not.be.null;
    }
});
```

### Libary not loaded error

macOS users encountering "dyld: Library not loaded" error? Then follow the answer from this [stackoverflow post](https://stackoverflow.com/questions/55754551/how-to-install-imagemagick-portably-on-macos-when-i-cant-set-dyld-library-path) to set the correct path to \*.dylib.

### Using Apple Silicon

If you have issues running the app using Apple Silicon, be sure to install the following:
```
brew install pkg-config cairo pango
brew install libpng jpeg giflib librsvg
```

## Example Projects

-   [Using Mocha + Chai](/examples/mocha)
-   [Using Cypress](/examples/cypress)
