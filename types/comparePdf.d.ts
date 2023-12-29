export as namespace ComparePdf;

export default ComparePdf;

export interface ComparePdfConfig {
    paths: {
        actualPdfRootFolder: string;
        baselinePdfRootFolder: string;
        actualPngRootFolder: string;
        baselinePngRootFolder: string;
        diffPngRootFolder: string;
    };
    settings: {
        imageEngine: string;
        density: number | string;
        quality: number | string;
        tolerance: number | string;
        threshold: number | string;
        cleanPngPaths?: boolean;
        matchPageCount?: boolean;
        disableFontFace?: boolean;
        verbosity?: number | string;
        diffColor?: [number, number, number];
        diffColorAlt?: [number, number, number] | null;
    };
}

export interface ComparePdfOpts {
    masks: PageMask[];
    crops: PageCrop[];
    onlyPageIndexes: Array<string | number>;
    skipPageIndexes: Array<string | number>;
}

export interface Coordinates {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export interface Dimension {
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface PageMask {
    pageIndex: number;
    coordinates: Coordinates;
    color?: string;
}

export interface PageCrop {
    pageIndex: number;
    coordinates: Dimension;
}

export interface Details {
    status: string;
    numDiffPixels: string;
    diffPng: string;
}

export interface Results {
    status: string;
    message: string;
    details?: Details[];
}

declare class ComparePdf {
    constructor(config?: ComparePdfConfig);

    opts: ComparePdfOpts;

    baselinePdfBuffer(baselinePdfBuffer: Uint8Array, baselinePdfFilename?: string): ComparePdf;

    baselinePdfFile(baselinePdf: string): ComparePdf;

    actualPdfBuffer(actualPdfBuffer: Uint8Array, actualPdfFilename?: string): ComparePdf;

    actualPdfFile(actualPdf: string): ComparePdf;

    addMask(pageIndex: number, coordinates?: Coordinates, color?: string): ComparePdf;

    addMasks(masks: PageMask[]): ComparePdf;

    onlyPageIndexes(pageIndexes: Array<string | number>): ComparePdf;

    skipPageIndexes(pageIndexes: Array<string | number>): ComparePdf;

    cropPage(pageIndex: number, coordinates?: Dimension): ComparePdf;

    cropPages(cropPagesList: PageCrop[]): ComparePdf;

    compare(comparisonType?: string): Promise<Results>;
}
