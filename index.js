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
        threshold: 0.05,
        cleanPngPaths: true
    }
};

const copyJsonObject = (jsonObject) => {
    return JSON.parse(JSON.stringify(jsonObject));
};

const ensureAndCleanupPath = (filepath) => {
    fs.ensureDirSync(filepath);
    fs.emptyDirSync(filepath);
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

const applyCrop = (pngFilePath, coordinates = { width: 0, height: 0, x: 0, y: 0 }) => {
    return new Promise((resolve, reject) => {
        gm(pngFilePath)
            .crop(coordinates.width, coordinates.height, coordinates.x, coordinates.y)
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

            let threshold = config.settings && config.settings.threshold ? config.settings.threshold : 0.05;
            let tolerance = config.settings && config.settings.tolerance ? config.settings.tolerance : 0;

            let numDiffPixels = pixelmatch(actualPng.data, baselinePng.data, diffPng.data, width, height, {
                threshold: threshold
            });

            if (numDiffPixels > tolerance) {
                fs.writeFileSync(diff, PNG.sync.write(diffPng));
                resolve({ status: "failed", numDiffPixels: numDiffPixels, diffPng: diff });
            } else {
                resolve({ status: "passed" });
            }
        } catch (error) {
            resolve({ status: "failed", actual: actual, error: error });
        }
    });
};

const comparePdfByImage = async (actualPdf, baselinePdf, config) => {
    return new Promise(async (resolve, reject) => {
        const actualPdfBaseName = path.parse(actualPdf).name;
        const baselinePdfBaseName = path.parse(baselinePdf).name;

        const actualPngDirPath = `${config.paths.actualPngRootFolder}/${actualPdfBaseName}`;
        ensureAndCleanupPath(actualPngDirPath);
        const actualPngFilePath = `${actualPngDirPath}/${actualPdfBaseName}.png`;

        const baselinePngDirPath = `${config.paths.baselinePngRootFolder}/${baselinePdfBaseName}`;
        ensureAndCleanupPath(baselinePngDirPath);
        const baselinePngFilePath = `${baselinePngDirPath}/${baselinePdfBaseName}.png`;

        const diffPngDirPath = `${config.paths.diffPngRootFolder}/${actualPdfBaseName}`;
        ensureAndCleanupPath(diffPngDirPath);

        await pdfToPng(actualPdf, actualPngFilePath, config);
        await pdfToPng(baselinePdf, baselinePngFilePath, config);

        let actualPngs = fs
            .readdirSync(actualPngDirPath)
            .filter((pngFile) => path.parse(pngFile).name.startsWith(actualPdfBaseName));
        let baselinePngs = fs
            .readdirSync(baselinePngDirPath)
            .filter((pngFile) => path.parse(pngFile).name.startsWith(baselinePdfBaseName));

        if (actualPngs.length !== baselinePngs.length) {
            resolve({
                status: "failed",
                message: `Actual pdf page count (${actualPngs.length}) is not the same as Baseline pdf (${baselinePngs.length}).`
            });
        }

        let comparisonResults = [];
        for (let index = 0; index < baselinePngs.length; index++) {
            let suffix = "";
            if (baselinePngs.length > 1) {
                suffix = `-${index}`;
            }

            let actualPng = `${actualPngDirPath}/${actualPdfBaseName}${suffix}.png`;
            let baselinePng = `${baselinePngDirPath}/${baselinePdfBaseName}${suffix}.png`;
            let diffPng = `${diffPngDirPath}/${actualPdfBaseName}_diff${suffix}.png`;

            if (config.skipPageIndexes && config.skipPageIndexes.length > 0) {
                if (config.skipPageIndexes.includes(index)) {
                    continue;
                }
            }

            if (config.onlyPageIndexes && config.onlyPageIndexes.length > 0) {
                if (!config.onlyPageIndexes.includes(index)) {
                    continue;
                }
            }

            if (config.masks) {
                let pageMasks = _.filter(config.masks, { pageIndex: index });
                if (pageMasks && pageMasks.length > 0) {
                    for (const pageMask of pageMasks) {
                        await applyMask(actualPng, pageMask.coordinates, pageMask.color);
                        await applyMask(baselinePng, pageMask.coordinates, pageMask.color);
                    }
                }
            }

            if (config.crops) {
                let pageCroppings = _.filter(config.crops, { pageIndex: index });
                if (pageCroppings && pageCroppings.length > 0) {
                    for (const pageCrop of pageCroppings) {
                        await applyCrop(actualPng, pageCrop.coordinates);
                        await applyCrop(baselinePng, pageCrop.coordinates);
                    }
                }
            }

            comparisonResults.push(await comparePngs(actualPng, baselinePng, diffPng, config));
        }

        if (config.settings.cleanPngPaths) {
            ensureAndCleanupPath(config.paths.actualPngRootFolder);
            ensureAndCleanupPath(config.paths.baselinePngRootFolder);
        }

        const failedResults = _.filter(comparisonResults, (res) => res.status === "failed");
        if (failedResults.length > 0) {
            resolve({
                status: "failed",
                message: `${actualPdfBaseName}.pdf is not the same as ${baselinePdfBaseName}.pdf compared by their images.`,
                details: failedResults
            });
        } else {
            resolve({ status: "passed" });
        }
    });
};

const comparePdfByBase64 = async (actualPdf, baselinePdf, config) => {
    return new Promise(async (resolve, reject) => {
        const actualPdfBaseName = path.parse(actualPdf).name;
        const baselinePdfBaseName = path.parse(baselinePdf).name;
        const actualPdfBase64 = fs.readFileSync(actualPdf, { encoding: "base64" });
        const baselinePdfBase64 = fs.readFileSync(baselinePdf, { encoding: "base64" });
        if (actualPdfBase64 !== baselinePdfBase64) {
            resolve({
                status: "failed",
                message: `${actualPdfBaseName}.pdf is not the same as ${baselinePdfBaseName}.pdf compared by their base64 values.`
            });
        } else {
            resolve({ status: "passed" });
        }
    });
};

class ComparePdf {
    constructor(config = copyJsonObject(defaultConfig)) {
        this.config = config;
        ensurePathsExist(this.config);

        if (!this.config.masks) {
            this.config.masks = [];
        }

        if (!this.config.crops) {
            this.config.crops = [];
        }

        if (!this.config.onlyPageIndexes) {
            this.config.onlyPageIndexes = [];
        }

        if (!this.config.skipPageIndexes) {
            this.config.skipPageIndexes = [];
        }

        this.result = {
            status: "not executed"
        };
    }

    baselinePdfFile(baselinePdf) {
        if (baselinePdf) {
            const baselinePdfBaseName = path.parse(baselinePdf).name;
            if (fs.existsSync(baselinePdf)) {
                this.baselinePdf = baselinePdf;
            } else if (fs.existsSync(`${this.config.paths.baselinePdfRootFolder}/${baselinePdfBaseName}.pdf`)) {
                this.baselinePdf = `${this.config.paths.baselinePdfRootFolder}/${baselinePdfBaseName}.pdf`;
            } else {
                this.result = {
                    status: "failed",
                    message: "Baseline pdf file path does not exists. Please define correctly then try again."
                };
            }
        } else {
            this.result = {
                status: "failed",
                message: "Baseline pdf file path was not set. Please define correctly then try again."
            };
        }
        return this;
    }

    actualPdfFile(actualPdf) {
        if (actualPdf) {
            const actualPdfBaseName = path.parse(actualPdf).name;
            if (fs.existsSync(actualPdf)) {
                this.actualPdf = actualPdf;
            } else if (fs.existsSync(`${this.config.paths.actualPdfRootFolder}/${actualPdfBaseName}.pdf`)) {
                this.actualPdf = `${this.config.paths.actualPdfRootFolder}/${actualPdfBaseName}.pdf`;
            } else {
                this.result = {
                    status: "failed",
                    message: "Actual pdf file path does not exists. Please define correctly then try again."
                };
            }
        } else {
            this.result = {
                status: "failed",
                message: "Actual pdf file path was not set. Please define correctly then try again."
            };
        }
        return this;
    }

    addMask(pageIndex, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = "black") {
        this.config.masks.push({
            pageIndex: pageIndex,
            coordinates: coordinates,
            color: color
        });
        return this;
    }

    addMasks(masks) {
        this.config.masks = [...this.config.masks, ...masks];
        return this;
    }

    onlyPageIndexes(pageIndexes) {
        this.config.onlyPageIndexes = [...this.config.onlyPageIndexes, ...pageIndexes];
        return this;
    }

    skipPageIndexes(pageIndexes) {
        this.config.skipPageIndexes = [...this.config.skipPageIndexes, ...pageIndexes];
        return this;
    }

    cropPage(pageIndex, coordinates = { width: 0, height: 0, x: 0, y: 0 }) {
        this.config.crops.push({
            pageIndex: pageIndex,
            coordinates: coordinates
        });
        return this;
    }

    cropPages(cropPagesList) {
        this.config.crops = [...this.config.crops, ...cropPagesList];
        return this;
    }

    async compare(comparisonType = "byImage") {
        if (this.result.status === "not executed" || this.result.status !== "failed") {
            switch (comparisonType) {
                case "byBase64":
                    this.result = await comparePdfByBase64(this.actualPdf, this.baselinePdf, this.config);
                    break;
                case "byImage":
                default:
                    this.result = await comparePdfByImage(this.actualPdf, this.baselinePdf, this.config);
                    break;
            }
        }
        return this.result;
    }
}

module.exports = ComparePdf;
