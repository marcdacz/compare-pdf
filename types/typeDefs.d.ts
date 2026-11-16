type Canvas = import("@napi-rs/canvas").Canvas;
type SKRSContext2D = import("@napi-rs/canvas").SKRSContext2D;
/**
 * Logging verbosity levels
 */
type Verbosity = 0 | 1 | 5;
/**
 * Compare PDF Engines for image comparison
 */
type EngineType = "imageMagick" | "graphicsMagick" | "native";
/**
 * Compare PDF GraphicMagick Engines for image comparison
 */
type GraphicMagickEngineType = "imageMagick" | "graphicsMagick";
/**
 * Compare PDF comparison modes
 */
type CompareType = "Base64" | "Image";
/**
 * Compare PDF Config paths
 */
type Paths = {
	/**
	 * - optional, root folder of Actual PDF. Default "./data/actualPdfs"
	 */
	actualPdfRootFolder?: string | undefined;
	/**
	 * - optional, root folder of Baseline PDF. Default "./data/baselinePdfs"
	 */
	baselinePdfRootFolder?: string | undefined;
	/**
	 * - optional, root folder of Actual png/images. Default "./data/actualPngs"
	 */
	actualPngRootFolder?: string | undefined;
	/**
	 * - optional, root folder of Baseline png/images. Default "./data/baselinePngs"
	 */
	baselinePngRootFolder?: string | undefined;
	/**
	 * - optional, root folder of Difference png/images. Default "./data/diffPngs"
	 */
	diffPngRootFolder?: string | undefined;
};
/**
 * Compare PDF Config paths
 */
type Settings = {
	/**
	 * - optional, the image Engine to use: [ "imageMagick" | "graphicsMagick" | "native" ], Default "native"
	 */
	imageEngine?: EngineType | undefined;
	/**
	 * - optional, resolution used by the GraphicsMagick/ImageMagick CLI engines while rendering vector formats into an image. Default 100
	 */
	density?: number | undefined;
	/**
	 * - optional, compression level used by the GraphicsMagick/ImageMagick CLI engines. val ranges from 0 to 100 (best). Default 70
	 */
	quality?: number | undefined;
	/**
	 * - optional, the allowable pixel count that is different between the compared images. Default 0
	 */
	tolerance?: number | undefined;
	/**
	 * - optional, (from pixelmatch) ranges from 0 to 1. Smaller values make the comparison more sensitive. Default 0.05
	 */
	threshold?: number | undefined;
	/**
	 * - optional, boolean flag for cleaning png folders automatically. Default true
	 */
	cleanPngPaths?: boolean | undefined;
	/**
	 * - optional, boolean flag that enables or disables the page count verification between the actual and baseline PDFs. Default true
	 */
	matchPageCount?: boolean | undefined;
	/**
	 * - optional, specifies if fonts are converted to OpenType fonts and loaded by the Font Loading API or
	 */
	disableFontFace?: boolean | undefined;
};
/**
 * Compare PDF Config
 */
type Config = {
	paths?: Paths | undefined;
	settings?: Settings | undefined;
};
/**
 * Compare PDF Coordinates
 */
type Coordinates = {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
};
/**
 * Compare PDF Dimensions
 */
type Dimension = {
	width: number;
	height: number;
	x: number;
	y: number;
};
/**
 * Compare PDF PageMask
 */
type PageMask = {
	pageIndex: number;
	coordinates: Coordinates;
	color?: string | undefined;
};
/**
 * Compare PDF PageCrop
 */
type PageCrop = {
	pageIndex: number;
	dimension: Dimension;
};
/**
 * Compare PDF Opts
 */
type Opts = {
	masks?: PageMask[] | undefined;
	crops?: PageCrop[] | undefined;
	onlyPageIndexes?: number[] | undefined;
	skipPageIndexes?: number[] | undefined;
};
/**
 * Compare PDF Details
 */
type Details = {
	status: string;
	numDiffPixels: number;
	diffPng: string;
};
/**
 * Compare PDF Results
 */
type Results = {
	status: string;
	message?: string | undefined;
	details?: Details[] | undefined;
};
/**
 * Compare PDF CompareDetails
 */
type CompareDetails = {
	actualPdfFilename: string;
	baselinePdfFilename: string;
	actualPdfBuffer: Buffer;
	baselinePdfBuffer: Buffer;
};
/**
 * Compare PDF CompareImageDetails
 */
type CompareImageDetails = {
	actualPdfFilename: string;
	baselinePdfFilename: string;
	actualPdfBuffer: Buffer;
	baselinePdfBuffer: Buffer;
	config: Config;
	opts: Opts;
};
/**
 * Compare PDF PdfDetail
 */
type PdfDetail = {
	filename: string;
	buffer?: Buffer<ArrayBufferLike> | undefined;
};
/**
 * Compare PDF CanvasAndContext
 */
type CanvasAndContext = {
	canvas: Canvas;
	context: SKRSContext2D;
};
