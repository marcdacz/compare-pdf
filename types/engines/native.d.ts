declare namespace _default {
	export { applyMask };
	export { applyCrop };
	export { pdfToPng };
}
export default _default;
export type Config = any;
export type Coordinates = any;
export type Dimension = any;
export type PdfDetail = any;
/**************************************************
 * Apply mask to PNG image
 *
 * @param {string} pngFilePath
 * @param {Coordinates} coordinates
 * @param {string} [color="black"]
 * @return {Promise<boolean>}
 */
declare function applyMask(pngFilePath: string, coordinates?: Coordinates, color?: string): Promise<boolean>;
/**************************************************
 * Apply crop to PNG image
 *
 * @param {string} pngFilePath
 * @param {Dimension} coordinates
 * @param {number} [index=0]
 * @return {Promise<unknown>}
 */
declare function applyCrop(pngFilePath: string, coordinates?: Dimension, index?: number): Promise<unknown>;
/**************************************************
 * Convert PDF to PNG image
 *
 * @param {PdfDetail} pdfDetails
 * @param {string} pngFilePath
 * @param {Config} config
 * @return {Promise<void>}
 */
declare function pdfToPng(pdfDetails: PdfDetail, pngFilePath: string, config: Config): Promise<void>;
