<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/833px-PDF_file_icon.svg.png" height="128">

# compare-pdf

Standalone node module that compares pdfs

## Setup

Install the following system dependencies

-   [GraphicsMagick](http://www.graphicsmagick.org/README.html)
-   [ImageMagick](https://imagemagick.org/script/download.php)
-   [GhostScript](https://www.ghostscript.com/download.html)

Install npm module

```
npm install compare-pdf
```

## Basic Usage

```
it("Should be able to verify same PDFs", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("same.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.result).to.equal("passed");
});

it("Should be able to verify different PDFs", async () => {
    const ComparePdf = new comparePdf();
    let comparisonResults = await ComparePdf.actualPdfFile("notSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.result).to.equal("failed");
    expect(comparisonResults.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
    expect(comparisonResults.details).to.not.be.null;
});
```

## Using Masks

```
it("Should be able to verify same PDFs with Masks", async () => {
    let comparisonResults = await new comparePdf()
        .actualPdfFile("maskedSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .addMask(1, { x0: 35, y0: 70, x1: 145, y1: 95 })
        .addMask(1, { x0: 185, y0: 70, x1: 285, y1: 95 })
        .compare();
    expect(comparisonResults.result).to.equal("passed");
});

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
    expect(comparisonResults.result).to.equal("failed");
    expect(comparisonResults.message).to.equal("maskedNotSame.pdf is not the same as baseline.pdf.");
    expect(comparisonResults.details).to.not.be.null;
});
```

## Overriding Default Configs

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
            threshold: 0.05
    };
    let comparisonResults = await new comparePdf(config)
        .actualPdfFile("newSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.result).to.equal("passed");
});

it("Should be able to override specific config property", async () => {
    const ComparePdf = new comparePdf();
    ComparePdf.config.paths.actualPdfRootFolder = process.cwd() + "/data/newActualPdfs";
    let comparisonResults = await ComparePdf.actualPdfFile("newSame.pdf")
        .baselinePdfFile("baseline.pdf")
        .compare();
    expect(comparisonResults.result).to.equal("passed");
});
```
