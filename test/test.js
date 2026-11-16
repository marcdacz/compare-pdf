import { describe, it } from "mocha";
import path from "node:path";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as chai from "chai";
import chaiFiles from "chai-files";
import ComparePdf, { CompareBy, Engine, LogLevel } from "../functions/ComparePdf.js";

const defaultConfig = {
	paths: {
		actualPdfRootFolder: "./data/actualPdfs",
		actualPngRootFolder: "./data/actualPngs",
		baselinePdfRootFolder: "./data/baselinePdfs",
		baselinePngRootFolder: "./data/baselinePngs",
		diffPngRootFolder: "./data/diffPngs"
	},
	settings: {
		imageEngine: Engine.NATIVE,
		density: 100,
		quality: 70,
		tolerance: 0,
		threshold: 0.05,
		cleanPngPaths: true,
		matchPageCount: true,
		disableFontFace: true,
		verbosity: LogLevel.ERROR,
		password: undefined
	}
};

chai.use(chaiFiles);

/****************************************************
 * Returns the number of pages in a PDF file
 *
 * @param {Object} options
 * @param {string} options.url                    - The filename and path to the actual pdf
 * @param {string} [options.password=undefined]   - optional password of the PDF
 * @returns {Promise<number>}                     - The number of pages in the PDF
 * @private
 */
function getNoOfPages({ url, password = undefined } = {}) {
	return readFile(url)
		.then((file) => {
			return new Uint8Array(file.buffer, file.byteOffset, file.byteLength);
		})
		.then((content) => {
			return pdfjsLib.getDocument({ password: password, data: content });
		})
		.then((loadingTask) => {
			return loadingTask.promise;
		})
		.then((document) => {
			return Number(document["numPages"]);
		});
}

describe("Compare Pdf Common Tests", () => {
	it("Should be able to override default configs", async () => {
		const config = {
			paths: {
				actualPdfRootFolder: "./test/data/actualPdfs",
				baselinePdfRootFolder: "./test/data/baselinePdfs",
				actualPngRootFolder: "./test/data/actualPngs",
				baselinePngRootFolder: "./test/data/baselinePngs",
				diffPngRootFolder: "./test/data/diffPngs"
			},
			settings: {
				imageEngine: Engine.GRAPHICS_MAGICK,
				density: 80,
				quality: 80,
				tolerance: 100,
				threshold: 0.55,
				cleanPngPaths: false,
				matchPageCount: false,
				disableFontFace: false,
				verbosity: LogLevel.INFO,
				password: "foobar"
			}
		};
		const comparePdf = new ComparePdf(config);

		chai.expect(comparePdf.config).to.deep.equal(config);
	});

	[
		{
			actualPdfRootFolder: "./test/data/foo/bar"
		},
		{
			baselinePdfRootFolder: "./test/data/foo/bar"
		},
		{
			actualPngRootFolder: "./test/data/foo/bar"
		},
		{
			baselinePngRootFolder: "./test/data/foo/bar"
		},
		{
			diffPngRootFolder: "./test/data/foo/bar"
		}
	].forEach((property) => {
		const key = Object.keys(property)[0];
		const value = property[key];
		it(`Should be able to override paths ${key} config property`, async () => {
			const config = {
				paths: {}
			};
			config.paths[key] = value;
			const expectedConfig = structuredClone(defaultConfig);
			expectedConfig.paths[key] = value;
			const comparePdf = new ComparePdf(config);

			chai.expect(comparePdf.config).to.deep.equal(expectedConfig);
		});
	});

	[
		{
			imageEngine: Engine.GRAPHICS_MAGICK
		},
		{
			density: 80
		},
		{
			quality: 80
		},
		{
			tolerance: 100
		},
		{
			threshold: 0.55
		},
		{
			cleanPngPaths: false
		},
		{
			matchPageCount: false
		},
		{
			disableFontFace: false
		},
		{
			verbosity: LogLevel.INFO
		},
		{
			password: "foobar"
		}
	].forEach((property) => {
		const key = Object.keys(property)[0];
		const value = property[key];
		it(`Should be able to override settings ${key} config property`, async () => {
			const config = {
				settings: {}
			};
			config.settings[key] = value;
			const expectedConfig = structuredClone(defaultConfig);
			expectedConfig.settings[key] = value;
			const comparePdf = new ComparePdf(config);

			chai.expect(comparePdf.config).to.deep.equal(expectedConfig);
		});
	});

	["actualPdfRootFolder", "baselinePdfRootFolder"].forEach((key) => {
		it(`Should throw error when config has empty ${key}`, async () => {
			const config = {
				paths: {}
			};
			config.paths[key] = "";
			const fcn = function () {
				new ComparePdf(config);
			};

			chai.expect(fcn).to.throw("no such file or directory, mkdir ''");
		});
	});

	["actualPdfRootFolder", "baselinePdfRootFolder"].forEach((key) => {
		it(`Should throw error when config ${key} is null`, async () => {
			const config = {
				paths: {}
			};
			config.paths[key] = null;
			const fcn = function () {
				new ComparePdf(config);
			};
			chai
				.expect(fcn)
				.to.throw('The "path" argument must be of type string or an instance of Buffer or URL. Received null');
		});
	});

	[
		"actualPdfRootFolder",
		"baselinePdfRootFolder",
		"actualPngRootFolder",
		"baselinePngRootFolder",
		"diffPngRootFolder"
	].forEach((key) => {
		it(`Should keep default ${key} value when attempting to override value with undefined`, async () => {
			const config = {
				paths: {}
			};
			config.paths[key] = undefined;
			const comparePdf = new ComparePdf(config);

			chai.expect(comparePdf.config).to.deep.equal(defaultConfig);
		});
	});

	[
		"imageEngine",
		"density",
		"quality",
		"tolerance",
		"threshold",
		"cleanPngPaths",
		"matchPageCount",
		"disableFontFace",
		"verbosity",
		"password"
	].forEach((key) => {
		it(`Should keep default ${key} value when attempting to override value with undefined`, async () => {
			const config = {
				settings: {}
			};
			config.settings[key] = undefined;
			const comparePdf = new ComparePdf(config);

			chai.expect(comparePdf.config).to.deep.equal(defaultConfig);
		});
	});

	["actualPdfRootFolder", "baselinePdfRootFolder"].forEach((key) => {
		it(`Should create ${key} when it does not exist`, async () => {
			const config = {
				paths: {}
			};
			config.paths[key] = `./test/data/folders/${key}`;
			fs.rmSync(config.paths[key], { recursive: true, force: true, maxRetries: 3 });
			chai.expect(chaiFiles.dir(config.paths[key])).to.not.exist;
			const comparePdf = new ComparePdf(config);
			chai.expect(comparePdf.config.paths[key]).to.equal(config.paths[key]);
			chai.expect(chaiFiles.dir(comparePdf.config.paths[key])).to.exist;
		});
	});

	it("Should return failed when not passing actual pdf file name", async () => {
		const actualFileName = "";
		const baselineFileName = "baseline.pdf";
		const actualFolder = "actualPdfRootFolder";
		const baselineFolder = "baselinePdfRootFolder";
		const comparePdf = new ComparePdf();
		const actualFile = path.resolve(comparePdf.config.paths[actualFolder], actualFileName);
		const baselineFile = path.resolve(comparePdf.config.paths[baselineFolder], baselineFileName);

		chai.expect(chaiFiles.dir(actualFile)).to.exist;
		chai.expect(chaiFiles.file(baselineFile)).to.exist;

		const result = await comparePdf.init().actualPdfFile(actualFileName).baselinePdfFile(baselineFileName).compare();

		chai.expect(result.status).to.equal("failed");
		chai.expect(result.message).to.equal("Actual pdf file was not set. Please define correctly then try again.");
		chai.expect(chaiFiles.dir(actualFile)).to.exist;
		chai.expect(chaiFiles.file(baselineFile)).to.exist;
	});

	it("Should return failed when not passing baseline pdf file name", async () => {
		const actualFileName = "same.pdf";
		const baselineFileName = "";
		const actualFolder = "actualPdfRootFolder";
		const baselineFolder = "baselinePdfRootFolder";
		const comparePdf = new ComparePdf();
		const actualFile = path.resolve(comparePdf.config.paths[actualFolder], actualFileName);
		const baselineFile = path.resolve(comparePdf.config.paths[baselineFolder], baselineFileName);

		chai.expect(chaiFiles.file(actualFile)).to.exist;
		chai.expect(chaiFiles.dir(baselineFile)).to.exist;

		const result = await comparePdf.init().actualPdfFile(actualFileName).baselinePdfFile(baselineFileName).compare();

		chai.expect(result.status).to.equal("failed");
		chai.expect(result.message).to.equal("Baseline pdf is file was not set. Please define correctly then try again.");
		chai.expect(chaiFiles.file(actualFile)).to.exist;
		chai.expect(chaiFiles.dir(baselineFile)).to.exist;
	});

	it("Should return failed when passing invalid actual pdf file name", async () => {
		const actualFileName = "missing.pdf";
		const baselineFileName = "baseline.pdf";
		const actualFolder = "actualPdfRootFolder";
		const baselineFolder = "baselinePdfRootFolder";
		const comparePdf = new ComparePdf();
		const actualFile = path.resolve(comparePdf.config.paths[actualFolder], actualFileName);
		const baselineFile = path.resolve(comparePdf.config.paths[baselineFolder], baselineFileName);

		chai.expect(chaiFiles.file(actualFile)).to.not.exist;
		chai.expect(chaiFiles.file(baselineFile)).to.exist;

		const result = await comparePdf.init().actualPdfFile(actualFileName).baselinePdfFile(baselineFileName).compare();

		chai.expect(result.status).to.equal("failed");
		chai
			.expect(result.message)
			.to.equal(`Actual pdf file: '${actualFileName}' does not exist. Please define correctly then try again.`);
		chai.expect(chaiFiles.file(actualFile)).to.not.exist;
		chai.expect(chaiFiles.file(baselineFile)).to.exist;
	});

	it("Should return failed when passing invalid baseline pdf file name", async () => {
		const actualFileName = "same.pdf";
		const baselineFileName = "missing.pdf";
		const actualFolder = "actualPdfRootFolder";
		const baselineFolder = "baselinePdfRootFolder";
		const comparePdf = new ComparePdf();
		const actualFile = path.resolve(comparePdf.config.paths[actualFolder], actualFileName);
		const baselineFile = path.resolve(comparePdf.config.paths[baselineFolder], baselineFileName);

		chai.expect(chaiFiles.file(actualFile)).to.exist;
		chai.expect(chaiFiles.file(baselineFile)).to.not.exist;

		const result = await comparePdf.init().actualPdfFile(actualFileName).baselinePdfFile(baselineFileName).compare();

		chai.expect(result.status).to.equal("failed");
		chai
			.expect(result.message)
			.to.equal(`Baseline pdf file: '${baselineFileName}' does not exist. Please define correctly then try again.`);
		chai.expect(chaiFiles.file(actualFile)).to.exist;
		chai.expect(chaiFiles.file(baselineFile)).to.not.exist;
	});

	it("Should be able to verify PDFs byBase64 and when it fails then by Image", async () => {
		const comparePdf = new ComparePdf();
		const actualPdfFile = "notSame.pdf";
		const actualPdfFileName = path.parse(actualPdfFile).name;
		const expectedFile = path.resolve(
			comparePdf.config.paths.diffPngRootFolder,
			actualPdfFileName,
			`${actualPdfFileName}_diff-0.png`
		);
		const expected = [{ status: "failed", numDiffPixels: 515, diffPng: expectedFile }];

		const byBase64Result = await comparePdf
			.init()
			.actualPdfFile(actualPdfFile)
			.baselinePdfFile("baseline.pdf")
			.compare(CompareBy.BASE64);

		chai.expect(byBase64Result.status).to.equal("failed");
		chai
			.expect(byBase64Result.message)
			.to.equal("notSame.pdf is not the same as baseline.pdf compared by their base64 values.");

		const byImageResult = await comparePdf
			.init()
			.actualPdfFile(actualPdfFile)
			.baselinePdfFile("baseline.pdf")
			.compare(CompareBy.IMAGE);

		chai.expect(byImageResult.status).to.equal("failed");
		chai
			.expect(byImageResult.message)
			.to.equal("notSame.pdf is not the same as baseline.pdf compared by their images.");
		chai.expect(byImageResult.details).to.be.an("array");
		chai.expect(byImageResult.details).to.deep.equal(expected);
		chai.expect(chaiFiles.file(expectedFile)).to.exist;
	});
});

describe("Compare Pdf By Image Tests", () => {
	const keys = Object.keys(Engine);
	for (const key of keys) {
		const imageEngine = Engine[key];
		describe(`Engine: ${imageEngine}`, () => {
			const config = {
				settings: {
					imageEngine: imageEngine
				}
			};

			it("Should be able to verify same single page PDFs", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("singlePage.pdf")
					.baselinePdfFile("singlePage.pdf")
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same multi-page PDFs", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf.init().actualPdfFile("same.pdf").baselinePdfFile("baseline.pdf").compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same password protected multi-page PDFs ", async () => {
				const newConfig = structuredClone(defaultConfig);
				newConfig.settings.password = "Password";
				const comparePdf = new ComparePdf(newConfig);
				const result = await comparePdf
					.init()
					.actualPdfFile("same-passwordProtected.pdf")
					.baselinePdfFile("baseline.pdf")
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same password restricted to prevent printing, copying, modifying multi-page PDFs ", async () => {
				const newConfig = structuredClone(config);
				newConfig.settings.password = "Password";
				const comparePdf = new ComparePdf(newConfig);
				const result = await comparePdf
					.init()
					.actualPdfFile("same-passwordRestricted.pdf")
					.baselinePdfFile("baseline.pdf")
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs without extension", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf.init().actualPdfFile("same").baselinePdfFile("baseline").compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs using relative paths", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("../data/actualPdfs/same.pdf")
					.baselinePdfFile("../data/baselinePdfs/baseline.pdf")
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify different PDFs", async () => {
				const comparePdf = new ComparePdf(config);
				const actualPdfFile = "notSame.pdf";
				const actualPdfFileName = path.parse(actualPdfFile).name;
				const expectedFile = path.resolve(
					comparePdf.config.paths.diffPngRootFolder,
					actualPdfFileName,
					`${actualPdfFileName}_diff-0.png`
				);

				const result = await comparePdf.init().actualPdfFile(actualPdfFile).baselinePdfFile("baseline.pdf").compare();

				chai.expect(result.status).to.equal("failed");
				chai.expect(result.message).to.equal("notSame.pdf is not the same as baseline.pdf compared by their images.");
				chai.expect(result.details).to.be.an("array");
				chai.expect(result.details).to.have.lengthOf(1);
				chai.expect(result.details[0]).to.be.an("object");
				chai.expect(Object.keys(result.details[0])).to.have.lengthOf(3);
				chai.expect(result.details[0]).to.have.all.keys("status", "numDiffPixels", "diffPng");
				chai.expect(result.details[0].status).to.equal("failed");
				chai.expect(result.details[0].numDiffPixels).to.be.within(515, 517);
				chai.expect(result.details[0].diffPng).to.equal(expectedFile);
				chai.expect(chaiFiles.file(expectedFile)).to.exist;
			});

			it("Should be able to verify different PDFs when actual is single page and baseline is multiple[Issue-27]", async () => {
				const comparePdf = new ComparePdf(config);
				const actualPdfFileName = "singlePageForIssue27.pdf";
				const baselinePdfFileName = "multiPageForIssue27.pdf";
				const actualPdfNoOfPages = await getNoOfPages({
					url: path.resolve(comparePdf.config.paths.actualPdfRootFolder, actualPdfFileName)
				});
				const baselinePdfNoOfPages = await getNoOfPages({
					url: path.resolve(comparePdf.config.paths.baselinePdfRootFolder, baselinePdfFileName)
				});

				chai.expect(actualPdfNoOfPages).to.equal(1, "Expected actual Pdf file to have 1 page");
				chai.expect(baselinePdfNoOfPages).to.equal(2, "Expected base line Pdf file to have 2 pages");

				const result = await comparePdf
					.init()
					.actualPdfFile(actualPdfFileName)
					.baselinePdfFile(baselinePdfFileName)
					.compare();

				chai.expect(result.status).to.equal("failed");
				chai
					.expect(result.message)
					.to.equal(
						`Actual pdf page count (${actualPdfNoOfPages.toString()}) is not the same as Baseline pdf (${baselinePdfNoOfPages.toString()}).`
					);
			});

			it("Should be able to verify same PDFs using direct buffer", async () => {
				const actualPdfFilename = "same.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const comparePdf = new ComparePdf(config);
				const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(
					`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`
				);
				const result = await comparePdf
					.init()
					.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs using direct buffer passing filename in another way", async () => {
				const actualPdfFilename = "same.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const comparePdf = new ComparePdf(config);
				const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(
					`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`
				);
				const result = await comparePdf
					.init()
					.actualPdfBuffer(actualPdfBuffer)
					.actualPdfFile(actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer)
					.baselinePdfFile(baselinePdfFilename)
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify different PDFs using direct buffer", async () => {
				const actualPdfFilename = "notSame.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const comparePdf = new ComparePdf(config);
				const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(
					`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`
				);
				const result = await comparePdf
					.init()
					.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
					.compare();

				chai.expect(result.status).to.equal("failed");
				chai.expect(result.message).to.equal("notSame.pdf is not the same as baseline.pdf compared by their images.");
				chai.expect(result.details).to.not.be.null;
			});

			it("Should be able to verify same PDFs with Cropping's", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("same.pdf")
					.baselinePdfFile("baseline.pdf")
					.cropPage({ pageIndex: 1, dimension: { width: 530, height: 210, x: 0, y: 415 } })
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs with Multiple Cropping's", async () => {
				const croppings = [
					{ pageIndex: 0, dimension: { width: 210, height: 180, x: 615, y: 265 } },
					{ pageIndex: 0, dimension: { width: 210, height: 180, x: 615, y: 520 } },
					{ pageIndex: 1, dimension: { width: 530, height: 210, x: 0, y: 415 } }
				];
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("same.pdf")
					.baselinePdfFile("baseline.pdf")
					.cropPages(croppings)
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs with Masks", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("maskedSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.addMask({ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 } })
					.addMask({ pageIndex: 1, coordinates: { x0: 330, y0: 40, x1: 410, y1: 70 } })
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify different PDFs with Masks", async () => {
				const masks = [
					{ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 } },
					{ pageIndex: 1, coordinates: { x0: 330, y0: 40, x1: 410, y1: 70 } }
				];
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("maskedNotSame.pdf")
					.baselinePdfFile("maskBaseline.pdf")
					.addMasks(masks)
					.compare();

				chai.expect(result.status).to.equal("failed");
				chai
					.expect(result.message)
					.to.equal("maskedNotSame.pdf is not the same as maskBaseline.pdf compared by their images.");
				chai.expect(result.details).to.not.be.null;
			});

			it("Should be able to verify only specific page indexes", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("notSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.onlyPageIndexes([1])
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to verify only specific page indexes with pdfs having different page count", async () => {
				config.settings.matchPageCount = false;
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("notSamePageCount.pdf")
					.baselinePdfFile("notSamePageCount.pdf")
					.onlyPageIndexes([0])
					.compare();

				chai.expect(result.status).to.equal("passed");
			});

			it("Should be able to skip specific page indexes", async () => {
				const comparePdf = new ComparePdf(config);
				const result = await comparePdf
					.init()
					.actualPdfFile("notSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.skipPageIndexes([0])
					.compare();

				chai.expect(result.status).to.equal("passed");
			});
		});
	}
});

describe("Compare Pdf By Base64 Tests", () => {
	it("Should be able to verify same PDFs", async () => {
		const comparePdf = new ComparePdf();
		const result = await comparePdf
			.init()
			.actualPdfFile("same.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare(CompareBy.BASE64);

		chai.expect(result.status).to.equal("passed");
	});

	it("Should be able to verify same PDFs using direct buffer", async () => {
		const actualPdfFilename = "same.pdf";
		const baselinePdfFilename = "baseline.pdf";
		const comparePdf = new ComparePdf();
		const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
		const baselinePdfBuffer = fs.readFileSync(
			`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`
		);

		const result = await comparePdf
			.init()
			.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
			.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
			.compare(CompareBy.BASE64);

		chai.expect(result.status).to.equal("passed");
	});

	it("Should be able to verify different PDFs", async () => {
		const comparePdf = new ComparePdf();
		const result = await comparePdf
			.init()
			.actualPdfFile("notSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare(CompareBy.BASE64);

		chai.expect(result.status).to.equal("failed");
		chai
			.expect(result.message)
			.to.equal("notSame.pdf is not the same as baseline.pdf compared by their base64 values.");
	});

	it("Should be able to verify different PDFs using direct buffer", async () => {
		const actualPdfFilename = "notSame.pdf";
		const baselinePdfFilename = "baseline.pdf";
		const comparePdf = new ComparePdf();
		const actualPdfBuffer = fs.readFileSync(`${comparePdf.config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
		const baselinePdfBuffer = fs.readFileSync(
			`${comparePdf.config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`
		);

		const result = await comparePdf
			.init()
			.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
			.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
			.compare(CompareBy.BASE64);

		chai.expect(result.status).to.equal("failed");
		chai
			.expect(result.message)
			.to.equal("notSame.pdf is not the same as baseline.pdf compared by their base64 values.");
	});
});

describe("Compare Pdf Image Opts", () => {
	it("Should be able to set image opts", async () => {
		const croppings = [
			{ pageIndex: 0, dimension: { width: 210, height: 180, x: 615, y: 265 } },
			{ pageIndex: 0, dimension: { width: 210, height: 180, x: 615, y: 520 } },
			{ pageIndex: 1, dimension: { width: 530, height: 210, x: 0, y: 415 } }
		];
		const crop = { pageIndex: 2, dimension: { width: 210, height: 180, x: 615, y: 265 } };
		const masks = [
			{ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 }, color: "black" },
			{ pageIndex: 1, coordinates: { x0: 330, y0: 40, x1: 410, y1: 70 }, color: "blue" }
		];
		const mask = { pageIndex: 2, coordinates: { x0: 10, y0: 30, x1: 100, y1: 70 }, color: "red" };

		const comparePdf = new ComparePdf();
		const result = await comparePdf
			.init()
			.actualPdfFile("maskedSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.cropPages(croppings)
			.cropPage(crop)
			.addMasks(masks)
			.addMask(mask)
			.onlyPageIndexes([0])
			.skipPageIndexes([1]);

		croppings.push(crop);
		masks.push(mask);
		chai.expect(result.opts).to.eql({
			masks: masks,
			crops: croppings,
			onlyPageIndexes: [0],
			skipPageIndexes: [1]
		});
		chai.expect(result.result.status).to.equal("not executed");
	});

	it("Should be able to get different set of opts", async () => {
		const comparePdf = new ComparePdf();
		const result = await comparePdf
			.init()
			.actualPdfFile("maskedSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.cropPage({ pageIndex: 1, dimension: { width: 530, height: 210, x: 0, y: 415 } })
			.addMask({ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 } });

		chai.expect(result.opts).to.eql({
			masks: [{ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 }, color: "black" }],
			crops: [{ pageIndex: 1, dimension: { width: 530, height: 210, x: 0, y: 415 } }],
			onlyPageIndexes: [],
			skipPageIndexes: []
		});
		chai.expect(result.result.status).to.equal("not executed");
	});
});
