/**
 * Enum for Log Levels
 */
export type LogLevel = Verbosity;
/**
 * @typedef {import("./typeDefs.js").EngineType} EngineType
 * @typedef {import("./typeDefs.js").Verbosity} Verbosity
 * @typedef {import("./typeDefs.js").CompareType} CompareType
 */
/**
 * Enum for Log Levels
 * @readonly
 * @enum {Verbosity}
 */
export const LogLevel: Readonly<{
	ERROR: 0;
	WARNING: 1;
	INFO: 5;
}>;
/**
 * Enum for accepted Engines
 */
export type Engine = EngineType;
/**
 * Enum for accepted Engines
 * @readonly
 * @enum {EngineType}
 */
export const Engine: Readonly<{
	IMAGE_MAGICK: "imageMagick";
	GRAPHICS_MAGICK: "graphicsMagick";
	NATIVE: "native";
}>;
/**
 * Enum for Image Compare Mode
 */
export type CompareBy = CompareType;
/**
 * Enum for Image Compare Mode
 * @readonly
 * @enum {CompareType}
 */
export const CompareBy: Readonly<{
	BASE64: "Base64";
	IMAGE: "Image";
}>;
export type EngineType = any;
export type Verbosity = any;
export type CompareType = any;
