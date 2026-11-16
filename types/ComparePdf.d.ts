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
	 * @param {string} [config.settings.password=undefined]                               - optional, setting to supply a password for a password protected or restricted PDF. Default undefined
	 * @return {ComparePdf}
	 */
	constructor({
		paths: {
			actualPdfRootFolder,
			actualPngRootFolder,
			baselinePdfRootFolder,
			baselinePngRootFolder,
			diffPngRootFolder
		},
		settings: {
			imageEngine,
			density,
			quality,
			tolerance,
			threshold,
			cleanPngPaths,
			matchPageCount,
			disableFontFace,
			verbosity,
			password
		}
	}?: Config);
	config: {
		paths: {
			actualPdfRootFolder: any;
			actualPngRootFolder: any;
			baselinePdfRootFolder: any;
			baselinePngRootFolder: any;
			diffPngRootFolder: any;
		};
		settings: {
			imageEngine: any;
			density: any;
			quality: any;
			tolerance: any;
			threshold: any;
			cleanPngPaths: any;
			matchPageCount: any;
			disableFontFace: any;
			verbosity: any;
			password: any;
		};
	};
	/**************************************************
	 * ComparePdf Options
	 *
	 * @type {Opts}
	 */
	opts: Opts;
	/**************************************************
	 * ComparePdf Options
	 *
	 * @type {Results}
	 */
	result: Results;
	/**************************************************
	 * Initialisation method
	 * Should be chained first
	 *
	 * @memberOf ComparePdf
	 * @return {ComparePdf}
	 */
	init(): ComparePdf;
	/****************************************************
	 *
	 * @param {Buffer} baselinePdfBuffer
	 * @param {string} [baselinePdfFilename=undefined]
	 * @return {ComparePdf}
	 */
	baselinePdfBuffer(baselinePdfBuffer: Buffer, baselinePdfFilename?: string): ComparePdf;
	baselinePdfBufferData: Buffer<ArrayBufferLike> | undefined;
	baselinePdf: string | undefined;
	/****************************************************
	 *
	 * @param {string} baselinePdf
	 * @return {ComparePdf}
	 */
	baselinePdfFile(baselinePdf: string): ComparePdf;
	/****************************************************
	 *
	 * @param {Buffer} actualPdfBuffer
	 * @param {string} [actualPdfFilename=undefined]
	 * @return {ComparePdf}
	 */
	actualPdfBuffer(actualPdfBuffer: Buffer, actualPdfFilename?: string): ComparePdf;
	actualPdfBufferData: Buffer<ArrayBufferLike> | undefined;
	actualPdf: string | undefined;
	/****************************************************
	 *
	 * @param {string} actualPdf
	 * @return {ComparePdf}
	 */
	actualPdfFile(actualPdf: string): ComparePdf;
	/****************************************************
	 *
	 * @param {PageMask} mask
	 * @param {number} mask.pageIndex          - page index for the mask to be applied on, starting from 0 i.e. 0 for the first page, 1 for the second page, and so on.
	 * @param {Coordinates} mask.coordinates
	 * @param {string} [mask.color="black"]
	 * @return {ComparePdf}
	 */
	addMask({ pageIndex, coordinates, color }: PageMask): ComparePdf;
	/****************************************************
	 *
	 * @param {PageMask[]} masks
	 * @return {ComparePdf}
	 */
	addMasks(masks: PageMask[]): ComparePdf;
	/****************************************************
	 *
	 * @param {number[]} [pageIndexes=[]]
	 * @return {ComparePdf}
	 */
	onlyPageIndexes(pageIndexes?: number[]): ComparePdf;
	/****************************************************
	 *
	 * @param {number[]} [pageIndexes=[]]
	 * @return {ComparePdf}
	 */
	skipPageIndexes(pageIndexes?: number[]): ComparePdf;
	/****************************************************
	 *
	 * @param {PageCrop} pageCrop
	 * @return {ComparePdf}
	 */
	cropPage(pageCrop: PageCrop): ComparePdf;
	/****************************************************
	 *
	 * @param {PageCrop[]} cropPagesList
	 * @return {ComparePdf}
	 */
	cropPages(cropPagesList: PageCrop[]): ComparePdf;
	/****************************************************
	 *
	 * @param {CompareType} [comparisonType=CompareBy.IMAGE]
	 * @return {Promise<Results>}
	 */
	compare(comparisonType?: CompareType): Promise<Results>;
}
export type CompareType = any;
export type Config = any;
export type Coordinates = any;
export type Dimension = any;
export type EngineType = any;
export type Opts = any;
export type PageCrop = any;
export type PageMask = any;
export type Paths = any;
export type Results = any;
export type Settings = any;
export type Verbosity = any;
import { CompareBy } from "./enums.js";
import { Engine } from "./enums.js";
import { LogLevel } from "./enums.js";
export { CompareBy, Engine, LogLevel };
