import * as fs from "node:fs";
import path from "node:path";
import utils from "./utils.js";
import compareData from "./compareData.js";
import compareImages from "./compareImages.js";
import { CompareBy, Engine, LogLevel } from "./enums.js";

/**
 * @typedef {import("./typeDefs.js").CompareType} CompareType
 * @typedef {import("./typeDefs.js").Config} Config
 * @typedef {import("./typeDefs.js").Coordinates} Coordinates
 * @typedef {import("./typeDefs.js").Dimension} Dimension
 * @typedef {import("./typeDefs.js").EngineType} EngineType
 * @typedef {import("./typeDefs.js").Opts} Opts
 * @typedef {import("./typeDefs.js").PageCrop} PageCrop
 * @typedef {import("./typeDefs.js").PageMask} PageMask
 * @typedef {import("./typeDefs.js").Paths} Paths
 * @typedef {import("./typeDefs.js").Results} Results
 * @typedef {import("./typeDefs.js").Settings} Settings
 * @typedef {import("./typeDefs.js").Verbosity} Verbosity
 */

export default class ComparePdf {
	/**************************************************
	 * @constructor Constructor for ComparePdf class
	 *
	 * @param {Config} [config={}]                                                        - optional paths object with the following options:
	 * @param {Paths} [config.paths={}]                                                   - optional paths object with the following options:
	 * @param {string} [config.paths.actualPdfRootFolder="./data/actualPdfs"]             - optional, root folder of Actual PDF. Default "./data/actualPdfs"
	 * @param {string} [config.paths.actualPngRootFolder="./data/actualPngs"]             - optional, root folder of Actual png/images. Default "./data/actualPngs"
	 * @param {string} [config.paths.baselinePdfRootFolder="./data/baselinePdfs"]         - optional, root folder of Baseline PDF. Default "./data/baselinePdfs"
	 * @param {string} [config.paths.baselinePngRootFolder="./data/baselinePngs"]         - optional, root folder of Baseline png/images. Default "./data/baselinePngs"
	 * @param {string} [config.paths.diffPngRootFolder="./data/diffPngs"]                 - optional, root folder of Difference png/images. Default "./data/diffPngs"
	 * @param {Settings} [config.settings={}]                                             - optional, settings object with the following options:
	 * @param {EngineType} [config.settings.imageEngine=Engine.NATIVE]                    - optional, the image Engine to use: [ "imageMagick" | "graphicsMagick" | "native" ], Default "native"
	 * @param {number} [config.settings.density=100]                                      - optional, resolution used by the GraphicsMagick/ImageMagick CLI engines while rendering vector formats into an image. Default 100
	 * @param {number} [config.settings.quality=70]                                       - optional, compression level used by the GraphicsMagick/ImageMagick CLI engines. val ranges from 0 to 100 (best). Default 70
	 * @param {number} [config.settings.tolerance=0]                                      - optional, the allowable pixel count that is different between the compared images. Default 0
	 * @param {number} [config.settings.threshold=0.05]                                   - optional, (from pixelmatch) ranges from 0 to 1. Smaller values make the comparison more sensitive. Default 0.05
	 * @param {boolean} [config.settings.cleanPngPaths=true]                              - optional, boolean flag for cleaning png folders automatically. Default true
	 * @param {boolean} [config.settings.matchPageCount=true]                             - optional, boolean flag that enables or disables the page count verification between the actual and baseline PDFs. Default true
	 * @param {boolean} [config.settings.disableFontFace=true]                            - optional, specifies if fonts are converted to OpenType fonts and loaded by the Font Loading API or @font-face rules.
	 *                                                                                    - If false, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands, default true
	 * @param {Verbosity} [config.settings.verbosity=LogLevel.ERROR]                      - optional, specifies the logging level, default LogLevel.Error, Error = 0, Warning = 1, Info = 5. Default 0 Error
	 * @param {string} [config.settings.password]                                         - optional, setting to supply a password for a password protected or restricted PDF. Default undefined
	 * @return {ComparePdf}
	 */
	constructor({
		paths: {
			actualPdfRootFolder = "./data/actualPdfs",
			actualPngRootFolder = "./data/actualPngs",
			baselinePdfRootFolder = "./data/baselinePdfs",
			baselinePngRootFolder = "./data/baselinePngs",
			diffPngRootFolder = "./data/diffPngs"
		} = {},
		settings: {
			imageEngine = Engine.NATIVE,
			density = 100,
			quality = 70,
			tolerance = 0,
			threshold = 0.05,
			cleanPngPaths = true,
			matchPageCount = true,
			disableFontFace = true,
			verbosity = LogLevel.ERROR,
			password = undefined
		} = {}
	} = {}) {
		this.config = {
			paths: {
				actualPdfRootFolder: actualPdfRootFolder,
				actualPngRootFolder: actualPngRootFolder,
				baselinePdfRootFolder: baselinePdfRootFolder,
				baselinePngRootFolder: baselinePngRootFolder,
				diffPngRootFolder: diffPngRootFolder
			},
			settings: {
				imageEngine: imageEngine,
				density: density,
				quality: quality,
				tolerance: tolerance,
				threshold: threshold,
				cleanPngPaths: cleanPngPaths,
				matchPageCount: matchPageCount,
				disableFontFace: disableFontFace,
				verbosity: verbosity,
				password: password
			}
		};
		utils.ensurePathsExist(this.config);

		/**************************************************
		 * ComparePdf Options
		 *
		 * @type {Opts}
		 */
		this.opts = {
			masks: [],
			crops: [],
			onlyPageIndexes: [],
			skipPageIndexes: []
		};

		/**************************************************
		 * ComparePdf Options
		 *
		 * @type {Results}
		 */
		this.result = {
			status: "not executed",
			message: undefined
		};

		return this;
	}

	/**************************************************
	 * Initialisation method
	 * Should be chained first
	 *
	 * @memberOf ComparePdf
	 * @return {ComparePdf}
	 */
	init() {
		this.opts = {
			masks: [],
			crops: [],
			onlyPageIndexes: [],
			skipPageIndexes: []
		};

		this.result = {
			status: "not executed",
			message: undefined
		};
		return this;
	}

	/****************************************************
	 *
	 * @param {Buffer} baselinePdfBuffer
	 * @param {string} [baselinePdfFilename=undefined]
	 * @return {ComparePdf}
	 */
	baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename = undefined) {
		if (Buffer.isBuffer(baselinePdfBuffer)) {
			this.baselinePdfBufferData = baselinePdfBuffer;
			if (baselinePdfFilename) {
				this.baselinePdf = baselinePdfFilename;
			}
		} else {
			this.result = {
				status: "failed",
				message: "Baseline pdf buffer is not a buffer. Please define correctly then try again."
			};
		}
		return this;
	}

	/****************************************************
	 *
	 * @param {string} baselinePdf
	 * @return {ComparePdf}
	 */
	baselinePdfFile(baselinePdf) {
		if (typeof baselinePdf !== "undefined" && baselinePdf !== "") {
			if (fs.existsSync(baselinePdf)) {
				this.baselinePdf = baselinePdf;
			} else {
				const baselineFileName = path.parse(baselinePdf).name;
				const baselineFile = path.resolve(this.config.paths.baselinePdfRootFolder, `${baselineFileName}.pdf`);

				if (fs.existsSync(baselineFile)) {
					this.baselinePdf = baselineFile;
				} else {
					this.result = {
						status: "failed",
						message: `Baseline pdf file: '${baselinePdf}' does not exist. Please define correctly then try again.`
					};
				}
			}
		} else {
			this.result = {
				status: "failed",
				message: "Baseline pdf is file was not set. Please define correctly then try again."
			};
		}
		return this;
	}

	/****************************************************
	 *
	 * @param {Buffer} actualPdfBuffer
	 * @param {string} [actualPdfFilename=undefined]
	 * @return {ComparePdf}
	 */
	actualPdfBuffer(actualPdfBuffer, actualPdfFilename = undefined) {
		if (Buffer.isBuffer(actualPdfBuffer)) {
			this.actualPdfBufferData = actualPdfBuffer;
			if (actualPdfFilename) {
				this.actualPdf = actualPdfFilename;
			}
		} else {
			this.result = {
				status: "failed",
				message: "Actual pdf buffer is not a buffer. Please define correctly then try again."
			};
		}
		return this;
	}

	/****************************************************
	 *
	 * @param {string} actualPdf
	 * @return {ComparePdf}
	 */
	actualPdfFile(actualPdf) {
		if (typeof actualPdf !== "undefined" && actualPdf !== "") {
			if (fs.existsSync(actualPdf)) {
				this.actualPdf = actualPdf;
			} else {
				const actualFileName = path.parse(actualPdf).name;
				const actualFile = path.resolve(this.config.paths.actualPdfRootFolder, `${actualFileName}.pdf`);

				if (fs.existsSync(actualFile)) {
					this.actualPdf = actualFile;
				} else {
					this.result = {
						status: "failed",
						message: `Actual pdf file: '${actualPdf}' does not exist. Please define correctly then try again.`
					};
				}
			}
		} else {
			this.result = {
				status: "failed",
				message: "Actual pdf file was not set. Please define correctly then try again."
			};
		}
		return this;
	}

	/****************************************************
	 *
	 * @param {PageMask} mask
	 * @param {number} mask.pageIndex          - page index for the mask to be applied on, starting from 0 i.e. 0 for the first page, 1 for the second page, and so on.
	 * @param {Coordinates} mask.coordinates
	 * @param {string} [mask.color="black"]
	 * @return {ComparePdf}
	 */
	addMask({ pageIndex, coordinates, color = "black" }) {
		this.opts.masks.push({
			pageIndex: pageIndex,
			coordinates: coordinates,
			color: color
		});
		return this;
	}

	/****************************************************
	 *
	 * @param {PageMask[]} masks
	 * @return {ComparePdf}
	 */
	addMasks(masks) {
		masks.forEach((mask) => {
			this.addMask(mask);
		});
		return this;
	}

	/****************************************************
	 *
	 * @param {number[]} [pageIndexes=[]]
	 * @return {ComparePdf}
	 */
	onlyPageIndexes(pageIndexes = []) {
		this.opts.onlyPageIndexes = [...this.opts.onlyPageIndexes, ...pageIndexes];
		return this;
	}

	/****************************************************
	 *
	 * @param {number[]} [pageIndexes=[]]
	 * @return {ComparePdf}
	 */
	skipPageIndexes(pageIndexes = []) {
		this.opts.skipPageIndexes = [...this.opts.skipPageIndexes, ...pageIndexes];
		return this;
	}

	/****************************************************
	 *
	 * @param {PageCrop} pageCrop
	 * @return {ComparePdf}
	 */
	cropPage(pageCrop) {
		this.opts.crops.push(pageCrop);
		return this;
	}

	/****************************************************
	 *
	 * @param {PageCrop[]} cropPagesList
	 * @return {ComparePdf}
	 */
	cropPages(cropPagesList) {
		this.opts.crops = [...this.opts.crops, ...cropPagesList];
		return this;
	}

	/****************************************************
	 *
	 * @param {CompareType} [comparisonType=CompareBy.IMAGE]
	 * @return {Promise<Results>}
	 */
	async compare(comparisonType = CompareBy.IMAGE) {
		if (this.result.status === "not executed" || this.result.status !== "failed") {
			const [actualPdfBuffer, baselinePdfBuffer] = await Promise.all([
				this.actualPdfBufferData ? Promise.resolve(this.actualPdfBufferData) : fs.promises.readFile(this.actualPdf),
				this.baselinePdfBufferData
					? Promise.resolve(this.baselinePdfBufferData)
					: fs.promises.readFile(this.baselinePdf)
			]);
			const compareDetails = {
				actualPdfFilename: this.actualPdf,
				baselinePdfFilename: this.baselinePdf,
				actualPdfBuffer: actualPdfBuffer, // , { encoding: "base64" }
				baselinePdfBuffer: baselinePdfBuffer,
				config: this.config,
				opts: this.opts
			};
			switch (comparisonType) {
				case CompareBy.BASE64:
					this.result = await compareData.comparePdfByBase64(compareDetails);
					break;
				case CompareBy.IMAGE:
				default:
					this.result = await compareImages.comparePdfByImage(compareDetails);
					break;
			}
		}
		return this.result;
	}
}

export { CompareBy, Engine, LogLevel };
