module.exports = {
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
    }
};
