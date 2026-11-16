export default NodeCanvasFactory;
export type CanvasAndContext = any;
/**
 * @typedef {import("../typeDefs.js").CanvasAndContext} CanvasAndContext
 */
declare class NodeCanvasFactory {
	/**************************************************
	 * Creates a canvas and its 2D context with the specified width and height.
	 *
	 * @param {number} width
	 * @param {number} height
	 * @return {CanvasAndContext}
	 */
	create(width: number, height: number): CanvasAndContext;
	/**************************************************
	 * Resets the canvas with the specified width and height.
	 *
	 * @param {CanvasAndContext} canvasAndContext
	 * @param {number} width
	 * @param {number} height
	 */
	reset(canvasAndContext: CanvasAndContext, width: number, height: number): void;
	/**************************************************
	 * Destroys the canvas and context, allowing for garbage collection.
	 *
	 * @param {CanvasAndContext} canvasAndContext
	 */
	destroy(canvasAndContext: CanvasAndContext): void;
}
