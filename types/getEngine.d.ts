/**
 * @typedef {import("./typeDefs.js").Config} Config
 * @typedef {import("./typeDefs.js").EngineType} EngineType
 * @typedef {import("./typeDefs.js").Coordinates} Coordinates
 * @typedef {import("./typeDefs.js").Dimension} Dimension
 * @typedef {import("./typeDefs.js").PdfDetail} PdfDetail
 */
/**************************************************
 * Factory function to get the appropriate engine based on the input
 *
 * @param {EngineType} [engine=Engine.NATIVE] - The engine type to use, Default is NATIVE
 * @return {(GraphicsMagick|native)}
 */
export default function getEngine(engine?: EngineType): (GraphicsMagick | {
    applyMask: (pngFilePath: string, coordinates?: import("./engines/native.js").Coordinates, color?: string) => Promise<boolean>;
    applyCrop: (pngFilePath: string, coordinates?: import("./engines/native.js").Dimension, index?: number) => Promise<unknown>;
    pdfToPng: (pdfDetails: import("./engines/native.js").PdfDetail, pngFilePath: string, config: import("./engines/native.js").Config) => Promise<void>;
});
export type Config = import("./typeDefs.js").Config;
export type EngineType = import("./typeDefs.js").EngineType;
export type Coordinates = import("./typeDefs.js").Coordinates;
export type Dimension = import("./typeDefs.js").Dimension;
export type PdfDetail = import("./typeDefs.js").PdfDetail;
import GraphicsMagick from "./engines/GraphicsMagick.js";
