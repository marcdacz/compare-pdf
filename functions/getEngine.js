import GraphicsMagick from "./engines/GraphicsMagick.js";
import native from "./engines/native.js";
import { Engine } from "./enums.js";

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
export default function getEngine(engine = Engine.NATIVE) {
	switch (engine) {
		case Engine.IMAGE_MAGICK:
			return new GraphicsMagick(Engine.IMAGE_MAGICK);
		case Engine.GRAPHICS_MAGICK:
			return new GraphicsMagick(Engine.GRAPHICS_MAGICK);
		default:
			return native;
	}
}
