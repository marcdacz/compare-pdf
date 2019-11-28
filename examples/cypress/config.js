module.exports = {
    paths: {
        actualPdfRootFolder: process.cwd() + "/testData/pdf/actual",
        baselinePdfRootFolder: process.cwd() + "/testData/pdf/baseline",
        actualPngRootFolder: process.cwd() + "/testData/png/actual",
        baselinePngRootFolder: process.cwd() + "/testData/png/baseline",
        diffPngRootFolder: process.cwd() + "/testData/png/diff"
    },
    settings: {
        density: 150,
        quality: 80,
        tolerance: 0,
        threshold: 0.1
    }
};
