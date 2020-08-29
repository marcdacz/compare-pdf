const fs = require('fs-extra');

const copyJsonObject = (jsonObject) => {
	return JSON.parse(JSON.stringify(jsonObject));
};

const ensureAndCleanupPath = (filepath) => {
	fs.ensureDirSync(filepath);
	fs.emptyDirSync(filepath);
};

const ensurePathsExist = (config) => {
	fs.ensureDirSync(config.paths.actualPdfRootFolder);
	fs.ensureDirSync(config.paths.baselinePdfRootFolder);
};

module.exports = {
	copyJsonObject,
	ensureAndCleanupPath,
	ensurePathsExist
};
