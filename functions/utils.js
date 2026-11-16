import * as fs from "node:fs";
import path from "node:path";

/**
 * @typedef {import("./typeDefs.js").Config} Config
 */

/**************************************************
 * Ensures that a directory is empty. Deletes directory contents
 * if the directory is not empty. If the directory does not exist,
 * it is created. The directory itself is not deleted.
 *
 * @param {string} dir        - directory to empty
 * @returns {undefined}
 */
function emptyDirSync(dir) {
	let items;
	try {
		items = fs.readdirSync(dir);
	} catch {
		fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
		return undefined;
	}

	items.forEach((item) => {
		item = path.join(dir, item);
		fs.rmSync(item, { recursive: true, force: true, maxRetries: 3 });
	});
	return undefined;
}

// /**************************************************
//  * Clones/copies a JSON Object
//  *
//  * @param {Object} obj    - JSON object to clone
//  * @returns {Object}
//  */
// const copyJsonObject = (obj) => {
// 	return structuredClone(obj);
// };

/**************************************************
 * Ensures that a directory is empty. Deletes directory contents
 * if the directory is not empty. If the directory does not exist,
 * it is created. The directory itself is not deleted.
 *
 * @param {string} filepath        - directory to ensure and clean
 * @returns {undefined}
 */
function ensureAndCleanupPath(filepath) {
	return emptyDirSync(filepath);
}

/**************************************************
 * Ensures actualPdfRootFolder and baselinePdfRootFolder
 * exists
 *
 * @param {Config} config        - directory to ensure and clean
 * @returns {undefined}
 */
function ensurePathsExist(config) {
	fs.mkdirSync(config.paths.actualPdfRootFolder, { recursive: true, mode: 0o777 });
	fs.mkdirSync(config.paths.baselinePdfRootFolder, { recursive: true, mode: 0o777 });
	return undefined;
}

export default {
	ensureAndCleanupPath,
	ensurePathsExist
};
