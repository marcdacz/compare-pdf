const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");
const gm = require("gm").subClass({ imageMagick: true });
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");

const defaultConfig = {
    paths: {
        actualPdfRootFolder: process.cwd() + "/data/actualPdfs",
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

const ensurePathsExist = (config) => {
    fs.ensureDirSync(config.paths.actualPdfRootFolder);
    fs.ensureDirSync(config.paths.baselinePdfRootFolder);
};

const applyMask = (pngFilePath, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = "black") => {
    return new Promise((resolve, reject) => {
        gm(pngFilePath)
            .drawRectangle(coordinates.x0, coordinates.y0, coordinates.x1, coordinates.y1)
            .fill(color)
            .write(pngFilePath, (err) => {
                err ? reject(err) : resolve();
            });
    });
};

const pdfToPng = (pdfFilePath, pngFilePath, config) => {
    return new Promise((resolve, reject) => {
        gm(pdfFilePath)
            .density(config.settings.density, config.settings.density)
            .quality(config.settings.quality)
            .write(pngFilePath, (err) => {
                err ? reject(err) : resolve();
            });
    });
};

const comparePngs = async (actual, baseline, diff, config) => {
    return new Promise((resolve, reject) => {
        try {
            const actualPng = PNG.sync.read(fs.readFileSync(actual));
            const baselinePng = PNG.sync.read(fs.readFileSync(baseline));
            const { width, height } = actualPng;
            const diffPng = new PNG({ width, height });
            let numDiffPixels = pixelmatch(actualPng.data, baselinePng.data, diffPng.data, width, height, {
                threshold: config.settings.threshold
            });
            if (numDiffPixels > config.settings.tolerance) {
                fs.writeFileSync(diff, PNG.sync.write(diffPng));
                resolve({ result: "failed", numDiffPixels: numDiffPixels, diffPng: diff });
            } else {
                resolve({ result: "passed" });
            }
        } catch (error) {
            resolve({ result: "failed", actual: actual, error: error });
        }
    });
};

const ensureAndCleanupPath = (filepath) => {
    fs.ensureDirSync(filepath);
    fs.emptyDirSync(filepath);
};

class ComparePdf {
    constructor(config = defaultConfig) {
        this.config = config;
        ensurePathsExist(this.config);

        this.result = "not executed";
        this.actualPdf = "";
        this.baselinePdf = "";
        this.masks = [];
    }

    baselinePdfFile(baselinePdf) {
        this.baselinePdfBaseName = path.parse(baselinePdf).name;

        if (fs.existsSync(this.baselinePdf)) {
            this.baselinePdf = baselinePdf;
        } else if (fs.existsSync(`${this.config.paths.baselinePdfRootFolder}/${this.baselinePdfBaseName}.pdf`)) {
            this.baselinePdf = `${this.config.paths.baselinePdfRootFolder}/${this.baselinePdfBaseName}.pdf`;
        }

        if (this.baselinePdfBaseName && this.baselinePdf) {
            return this;
        } else {
            return {
                result: "failed",
                message: "Baseline pdf file path was not set or does not exists. Please define then try again."
            };
        }
    }

    actualPdfFile(actualPdf) {
        this.actualPdfBaseName = path.parse(actualPdf).name;

        if (fs.existsSync(this.actualPdf)) {
            this.actualPdf = actualPdf;
        } else if (fs.existsSync(`${this.config.paths.actualPdfRootFolder}/${this.actualPdfBaseName}.pdf`)) {
            this.actualPdf = `${this.config.paths.actualPdfRootFolder}/${this.actualPdfBaseName}.pdf`;
        }

        if (this.actualPdfBaseName && this.actualPdf) {
            return this;
        } else {
            return {
                result: "failed",
                message: "Actual pdf file path was not set or does not exists. Please define then try again."
            };
        }
    }

    addMask(pageIndex, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = "black") {
        this.masks.push({
            pageIndex: pageIndex,
            coordinates: coordinates,
            color: color
        });
        return this;
    }

    addMasks(masks) {
        this.masks = [...this.masks, ...masks];
        return this;
    }

    async compare() {
        return new Promise(async (resolve, reject) => {
            const actualPngDirPath = `${this.config.paths.actualPngRootFolder}/${this.actualPdfBaseName}`;
            ensureAndCleanupPath(actualPngDirPath);
            const actualPngFilePath = `${actualPngDirPath}/${this.actualPdfBaseName}.png`;

            const baselinePngDirPath = `${this.config.paths.baselinePngRootFolder}/${this.baselinePdfBaseName}`;
            ensureAndCleanupPath(baselinePngDirPath);
            const baselinePngFilePath = `${baselinePngDirPath}/${this.baselinePdfBaseName}.png`;

            const diffPngDirPath = `${this.config.paths.diffPngRootFolder}/${this.actualPdfBaseName}`;
            ensureAndCleanupPath(diffPngDirPath);

            await pdfToPng(this.actualPdf, actualPngFilePath, this.config);
            await pdfToPng(this.baselinePdf, baselinePngFilePath, this.config);

            let actualPngs = fs
                .readdirSync(actualPngDirPath)
                .filter((pngFile) => path.parse(pngFile).name.startsWith(this.actualPdfBaseName));
            let baselinePngs = fs
                .readdirSync(baselinePngDirPath)
                .filter((pngFile) => path.parse(pngFile).name.startsWith(this.baselinePdfBaseName));

            if (actualPngs.length !== baselinePngs.length) {
                resolve({
                    result: "failed",
                    message: `Actual pdf page count (${actualPngs.length}) is not the same as Baseline pdf (${baselinePngs.length}).`
                });
            }

            let comparisonResults = [];
            for (let index = 0; index < baselinePngs.length; index++) {
                let actualPng = `${actualPngDirPath}/${this.actualPdfBaseName}-${index}.png`;
                let baselinePng = `${baselinePngDirPath}/${this.baselinePdfBaseName}-${index}.png`;
                let diffPng = `${diffPngDirPath}/${this.actualPdfBaseName}_diff-${index}.png`;

                if (this.masks) {
                    let pageMasks = _.filter(this.masks, { pageIndex: index });
                    if (pageMasks && pageMasks.length > 0) {
                        for (const pageMask of pageMasks) {
                            await applyMask(actualPng, pageMask.coordinates, pageMask.color);
                            await applyMask(baselinePng, pageMask.coordinates, pageMask.color);
                        }
                    }
                }

                comparisonResults.push(await comparePngs(actualPng, baselinePng, diffPng, this.config));
            }

            const failedResults = _.filter(comparisonResults, (res) => res.result === "failed");
            if (failedResults.length > 0) {
                resolve({
                    result: "failed",
                    message: `${this.actualPdfBaseName}.pdf is not the same as ${this.baselinePdfBaseName}.pdf.`,
                    details: failedResults
                });
            } else {
                resolve({ result: "passed" });
            }
        });
    }
}

module.exports = ComparePdf;
