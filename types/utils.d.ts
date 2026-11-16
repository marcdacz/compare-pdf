declare namespace _default {
	export { ensureAndCleanupPath };
	export { ensurePathsExist };
}
export default _default;
export type Config = any;
/**************************************************
 * Ensures that a directory is empty. Deletes directory contents
 * if the directory is not empty. If the directory does not exist,
 * it is created. The directory itself is not deleted.
 *
 * @param {string} filepath        - directory to ensure and clean
 * @returns {undefined}
 */
declare function ensureAndCleanupPath(filepath: string): undefined;
/**************************************************
 * Ensures actualPdfRootFolder and baselinePdfRootFolder
 * exists
 *
 * @param {Config} config        - directory to ensure and clean
 * @returns {undefined}
 */
declare function ensurePathsExist(config: Config): undefined;
