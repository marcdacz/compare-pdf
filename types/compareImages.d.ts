declare namespace _default {
	export { comparePngs };
	export { comparePdfByImage };
}
export default _default;
export type Config = any;
export type Results = any;
export type CompareImageDetails = any;
/**
 * @typedef {import("./typeDefs.js").Config} Config
 * @typedef {import("./typeDefs.js").Results} Results
 * @typedef {import("./typeDefs.js").CompareImageDetails} CompareImageDetails
 */
/****************************************************
 *
 * @param {string} actual
 * @param {string} baseline
 * @param {string} diff
 * @param {Config} config
 * @return {Promise<unknown>}
 */
declare function comparePngs(actual: string, baseline: string, diff: string, config: Config): Promise<unknown>;
/**************************************************
 *
 * @param {CompareImageDetails} compareDetails
 * @return {Promise<Results>}
 */
declare function comparePdfByImage(compareDetails: CompareImageDetails): Promise<Results>;
