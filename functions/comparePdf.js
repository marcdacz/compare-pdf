const fs = require('fs-extra');
const path = require('path');
const utils = require('./utils');
const compareData = require('./compareData');
const compareImages = require('./compareImages');

class ComparePdf {
	constructor(config = utils.copyJsonObject(require('./config'))) {
		this.config = config;
		utils.ensurePathsExist(this.config);

		if (!this.config.masks) {
			this.config.masks = [];
		}

		if (!this.config.crops) {
			this.config.crops = [];
		}

		if (!this.config.onlyPageIndexes) {
			this.config.onlyPageIndexes = [];
		}

		if (!this.config.skipPageIndexes) {
			this.config.skipPageIndexes = [];
		}

		this.result = {
			status: 'not executed'
		};
	}

	baselinePdfFile(baselinePdf) {
		if (baselinePdf) {
			const baselinePdfBaseName = path.parse(baselinePdf).name;
			if (fs.existsSync(baselinePdf)) {
				this.baselinePdf = baselinePdf;
			} else if (fs.existsSync(`${this.config.paths.baselinePdfRootFolder}/${baselinePdfBaseName}.pdf`)) {
				this.baselinePdf = `${this.config.paths.baselinePdfRootFolder}/${baselinePdfBaseName}.pdf`;
			} else {
				this.result = {
					status: 'failed',
					message: 'Baseline pdf file path does not exists. Please define correctly then try again.'
				};
			}
		} else {
			this.result = {
				status: 'failed',
				message: 'Baseline pdf file path was not set. Please define correctly then try again.'
			};
		}
		return this;
	}

	actualPdfFile(actualPdf) {
		if (actualPdf) {
			const actualPdfBaseName = path.parse(actualPdf).name;
			if (fs.existsSync(actualPdf)) {
				this.actualPdf = actualPdf;
			} else if (fs.existsSync(`${this.config.paths.actualPdfRootFolder}/${actualPdfBaseName}.pdf`)) {
				this.actualPdf = `${this.config.paths.actualPdfRootFolder}/${actualPdfBaseName}.pdf`;
			} else {
				this.result = {
					status: 'failed',
					message: 'Actual pdf file path does not exists. Please define correctly then try again.'
				};
			}
		} else {
			this.result = {
				status: 'failed',
				message: 'Actual pdf file path was not set. Please define correctly then try again.'
			};
		}
		return this;
	}

	addMask(pageIndex, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = 'black') {
		this.config.masks.push({
			pageIndex: pageIndex,
			coordinates: coordinates,
			color: color
		});
		return this;
	}

	addMasks(masks) {
		this.config.masks = [ ...this.config.masks, ...masks ];
		return this;
	}

	onlyPageIndexes(pageIndexes) {
		this.config.onlyPageIndexes = [ ...this.config.onlyPageIndexes, ...pageIndexes ];
		return this;
	}

	skipPageIndexes(pageIndexes) {
		this.config.skipPageIndexes = [ ...this.config.skipPageIndexes, ...pageIndexes ];
		return this;
	}

	cropPage(pageIndex, coordinates = { width: 0, height: 0, x: 0, y: 0 }) {
		this.config.crops.push({
			pageIndex: pageIndex,
			coordinates: coordinates
		});
		return this;
	}

	cropPages(cropPagesList) {
		this.config.crops = [ ...this.config.crops, ...cropPagesList ];
		return this;
	}

	async compare(comparisonType = 'byImage') {
		if (this.result.status === 'not executed' || this.result.status !== 'failed') {
			switch (comparisonType) {
				case 'byBase64':
					this.result = await compareData.comparePdfByBase64(this.actualPdf, this.baselinePdf, this.config);
					break;
				case 'byImage':
				default:
					this.result = await compareImages.comparePdfByImage(this.actualPdf, this.baselinePdf, this.config);
					break;
			}
		}
		return this.result;
	}
}

module.exports = ComparePdf;
