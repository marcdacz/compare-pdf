/**
 * @typedef {import("@napi-rs/canvas").Canvas} Canvas
 * @typedef {import("@napi-rs/canvas").SKRSContext2D} SKRSContext2D
 */

/**
 * @namespace ComparePDF
 * @description Namespace for ComparePDF type definitions
 */

/**
 * Logging verbosity levels
 *
 * @typedef {(0|1|5)} Verbosity
 * @memberof ComparePDF
 */

/**
 * Compare PDF Engines for image comparison
 *
 * @typedef {("imageMagick"|"graphicsMagick"|"native")} EngineType
 * @memberof ComparePDF
 */

/**
 * Compare PDF GraphicMagick Engines for image comparison
 *
 * @typedef {("imageMagick"|"graphicsMagick")} GraphicMagickEngineType
 * @memberof ComparePDF
 */

/**
 * Compare PDF comparison modes
 *
 * @typedef {("Base64"|"Image")} CompareType
 * @memberof ComparePDF
 */

/**
 * Compare PDF Config paths
 *
 * @typedef Paths
 * @type {Object}
 * @property {string} [actualPdfRootFolder="./data/actualPdfs"]     - optional, root folder of Actual PDF. Default "./data/actualPdfs"
 * @property {string} [baselinePdfRootFolder="./data/baselinePdfs"] - optional, root folder of Baseline PDF. Default "./data/baselinePdfs"
 * @property {string} [actualPngRootFolder="./data/actualPngs"]     - optional, root folder of Actual png/images. Default "./data/actualPngs"
 * @property {string} [baselinePngRootFolder="./data/baselinePngs"] - optional, root folder of Baseline png/images. Default "./data/baselinePngs"
 * @property {string} [diffPngRootFolder="./data/diffPngs"]         - optional, root folder of Difference png/images. Default "./data/diffPngs"
 * @memberof ComparePDF
 */

/**
 * Compare PDF Config paths
 *
 * @typedef Settings
 * @type {Object}
 * @property {EngineType} [imageEngine=Engine.NATIVE] - optional, the image Engine to use: [ "imageMagick" | "graphicsMagick" | "native" ], Default "native"
 * @property {number} [density=100]                   - optional, resolution used by the GraphicsMagick/ImageMagick CLI engines while rendering vector formats into an image. Default 100
 * @property {number} [quality=70]                    - optional, compression level used by the GraphicsMagick/ImageMagick CLI engines. val ranges from 0 to 100 (best). Default 70
 * @property {number} [tolerance=0]                   - optional, the allowable pixel count that is different between the compared images. Default 0
 * @property {number} [threshold=0.05]                - optional, (from pixelmatch) ranges from 0 to 1. Smaller values make the comparison more sensitive. Default 0.05
 * @property {boolean} [cleanPngPaths=true]           - optional, boolean flag for cleaning png folders automatically. Default true
 * @property {boolean} [matchPageCount=true]          - optional, boolean flag that enables or disables the page count verification between the actual and baseline PDFs. Default true
 * @property {Verbosity} [verbosity]                  - optional, specifies the logging level, default LogLevel.Error, Error = 0, Warning = 1, Info = 5. Default 0 Error
 * @property {string} [password]                      - optional, setting to supply a password for a password protected or restricted PDF. Default undefined
 * @property {boolean} [disableFontFace=true]         - optional, specifies if fonts are converted to OpenType fonts and loaded by the Font Loading API or @font-face rules.
 *                                                    - If false, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands, default true
 * @memberof ComparePDF
 */

/**
 * Compare PDF Config
 *
 * @typedef Config
 * @type {Object}
 * @property {Paths} [paths={}]
 * @property {Settings} [settings={}]
 * @memberof ComparePDF
 */

/**
 * Compare PDF Coordinates
 *
 * @typedef Coordinates
 * @type {Object}
 * @property {number} x0
 * @property {number} y0
 * @property {number} x1
 * @property {number} y1
 * @memberof ComparePDF
 */

/**
 * Compare PDF Dimensions
 *
 * @typedef Dimension
 * @type {Object}
 * @property {number} width
 * @property {number} height
 * @property {number} x
 * @property {number} y
 * @memberof ComparePDF
 */

/**
 * Compare PDF PageMask
 *
 * @typedef PageMask
 * @type {Object}
 * @property {number} pageIndex
 * @property {Coordinates} coordinates
 * @property {string} [color="black"]
 * @memberof ComparePDF
 */

/**
 * Compare PDF PageCrop
 *
 * @typedef PageCrop
 * @type {Object}
 * @property {number} pageIndex
 * @property {Dimension} dimension
 * @memberof ComparePDF
 */

/**
 * Compare PDF Opts
 *
 * @typedef Opts
 * @type {Object}
 * @property {PageMask[]} [masks]
 * @property {PageCrop[]} [crops]
 * @property {number[]} [onlyPageIndexes]
 * @property {number[]} [skipPageIndexes]
 * @memberof ComparePDF
 */

/**
 * Compare PDF Details
 *
 * @typedef Details
 * @type {Object}
 * @property {string} status
 * @property {number} numDiffPixels
 * @property {string} diffPng
 * @memberof ComparePDF
 */

/**
 * Compare PDF Results
 *
 * @typedef Results
 * @type {Object}
 * @property {string} status
 * @property {string} [message]
 * @property {Details[]} [details]
 * @memberof ComparePDF
 */

/**
 * Compare PDF Results
 *
 * @typedef Results
 * @type {Object}
 * @property {string} status
 * @property {string} [message]
 * @property {Details[]} [details]
 * @memberof ComparePDF
 */

/**
 * Compare PDF CompareDetails
 *
 * @typedef CompareDetails
 * @type {Object}
 * @property {string} actualPdfFilename
 * @property {string} baselinePdfFilename
 * @property {Buffer} actualPdfBuffer
 * @property {Buffer} baselinePdfBuffer
 * @memberof ComparePDF
 */

/**
 * Compare PDF CompareImageDetails
 *
 * @typedef CompareImageDetails
 * @type {Object}
 * @property {string} actualPdfFilename
 * @property {string} baselinePdfFilename
 * @property {Buffer} actualPdfBuffer
 * @property {Buffer} baselinePdfBuffer
 * @property {Config} config
 * @property {Opts} opts
 * @memberof ComparePDF
 */

/**
 * Compare PDF PdfDetail
 *
 * @typedef PdfDetail
 * @type {Object}
 * @property {string} filename
 * @property {Buffer} [buffer]
 * @memberof ComparePDF
 */

/**
 * Compare PDF CanvasAndContext
 *
 * @typedef CanvasAndContext
 * @type {Object}
 * @property {Canvas} canvas
 * @property {SKRSContext2D} context
 * @memberof ComparePDF
 */

export {};
