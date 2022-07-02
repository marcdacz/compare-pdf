const fs = require('fs-extra');
const comparePdf = require('../.');
const chai = require('chai');
const expect = chai.expect;

describe('Compare Pdf Common Tests', () => {
	it('Should be able to override default configs', async () => {
		let config = require('./newConfig');
		let comparisonResults = await new comparePdf(config)
			.actualPdfFile('newSame.pdf')
			.baselinePdfFile('baseline.pdf')
			.compare();
		expect(comparisonResults.status).to.equal('passed');
	});

	it('Should be able to override specific config property', async () => {
		const ComparePdf = new comparePdf();
		ComparePdf.config.paths.actualPdfRootFolder = process.cwd() + '/data/newActualPdfs';
		let comparisonResults = await ComparePdf.actualPdfFile('newSame.pdf').baselinePdfFile('baseline.pdf').compare();
		expect(comparisonResults.status).to.equal('passed');
	});

	it('Should be able to throw error when passing invalid actual pdf file path', async () => {
		let comparisonResults = await new comparePdf()
			.actualPdfFile('missing.pdf')
			.baselinePdfFile('baseline.pdf')
			.compare();
		expect(comparisonResults.status).to.equal('failed');
		expect(comparisonResults.message).to.equal(
			'Actual pdf file path does not exists. Please define correctly then try again.'
		);
	});

	['actualPngRootFolder', 'baselinePngRootFolder', 'diffPngRootFolder'].forEach((pngFolder) => {
		it(`Should be able to throw error when config has missing ${pngFolder}`, async () => {
			delete require.cache[require.resolve('./config')];
			let missingConfig = require('./config');
			missingConfig.paths[pngFolder] = '';
			let comparisonResults = await new comparePdf(missingConfig)
				.actualPdfFile('same')
				.baselinePdfFile('baseline')
				.compare();

			expect(comparisonResults.status).to.equal('failed');
			expect(comparisonResults.message).to.equal(
				'PNG directory is not set. Please define correctly then try again.'
			);
		});
	});

	it('Should be able to throw error when not passing actual pdf file path', async () => {
		let comparisonResults = await new comparePdf().actualPdfFile('').baselinePdfFile('baseline.pdf').compare();
		expect(comparisonResults.status).to.equal('failed');
		expect(comparisonResults.message).to.equal(
			'Actual pdf file path was not set. Please define correctly then try again.'
		);
	});

	it('Should be able to throw error when passing invalid baseline pdf file path', async () => {
		let comparisonResults = await new comparePdf()
			.actualPdfFile('same.pdf')
			.baselinePdfFile('missing.pdf')
			.compare();
		expect(comparisonResults.status).to.equal('failed');
		expect(comparisonResults.message).to.equal(
			'Baseline pdf file path does not exists. Please define correctly then try again.'
		);
	});

	it('Should be able to throw error when not passing baseline pdf file path', async () => {
		let comparisonResults = await new comparePdf().actualPdfFile('same.pdf').baselinePdfFile('').compare();
		expect(comparisonResults.status).to.equal('failed');
		expect(comparisonResults.message).to.equal(
			'Baseline pdf file path was not set. Please define correctly then try again.'
		);
	});

	it('Should be able to verify PDFs byBase64 and when it fails then byImage', async () => {
		let comparisonResultsByBase64 = await new comparePdf()
			.actualPdfFile('notSame.pdf')
			.baselinePdfFile('baseline.pdf')
			.compare('byBase64');
		expect(comparisonResultsByBase64.status).to.equal('failed');
		expect(comparisonResultsByBase64.message).to.equal(
			'notSame.pdf is not the same as baseline.pdf compared by their base64 values.'
		);

		if (comparisonResultsByBase64.status === 'failed') {
			let comparisonResultsByImage = await new comparePdf()
				.actualPdfFile('notSame.pdf')
				.baselinePdfFile('baseline.pdf')
				.compare('byImage');
			expect(comparisonResultsByImage.status).to.equal('failed');
			expect(comparisonResultsByImage.message).to.equal(
				'notSame.pdf is not the same as baseline.pdf compared by their images.'
			);
			expect(comparisonResultsByImage.details).to.not.be.null;
		}
	});
});

describe('Compare Pdf By Image Tests', () => {
	const engines = ['native', 'graphicsMagick'];
	for (const engine of engines) {
		describe(`Engine: ${engine}`, () => {
			let config;

			beforeEach(() => {
				delete require.cache[require.resolve('./config')];
				config = require('./config');
				config.settings.imageEngine = engine;


			});

			it('Should be able to verify same single page PDFs', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('singlePage.pdf')
					.baselinePdfFile('singlePage.pdf')
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify same multi-page PDFs', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('same.pdf')
					.baselinePdfFile('baseline.pdf')
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify same PDFs without extension', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('same')
					.baselinePdfFile('baseline')
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify same PDFs using relative paths', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('../data/actualPdfs/same.pdf')
					.baselinePdfFile('../data/baselinePdfs/baseline.pdf')
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify different PDFs', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('notSame.pdf')
					.baselinePdfFile('baseline.pdf')
					.compare();
				expect(comparisonResults.status).to.equal('failed');
				expect(comparisonResults.message).to.equal(
					'notSame.pdf is not the same as baseline.pdf compared by their images.'
				);
				expect(comparisonResults.details).to.not.be.null;
			});

			it('Should be able to verify same PDFs using direct buffer', async () => {
				const actualPdfFilename = "same.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

				let comparisonResults = await new comparePdf()
					.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify same PDFs using direct buffer passing filename in another way', async () => {
				const actualPdfFilename = "same.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

				let comparisonResults = await new comparePdf()
					.actualPdfBuffer(actualPdfBuffer)
					.actualPdfFile(actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer)
					.baselinePdfFile(baselinePdfFilename)
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify different PDFs using direct buffer', async () => {
				const actualPdfFilename = "notSame.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

				let comparisonResults = await new comparePdf()
					.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
					.compare();
				expect(comparisonResults.status).to.equal('failed');
				expect(comparisonResults.message).to.equal(
					'notSame.pdf is not the same as baseline.pdf compared by their images.'
				);
				expect(comparisonResults.details).to.not.be.null;
			});

			it('Should be able to verify same PDFs with Croppings', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('same.pdf')
					.baselinePdfFile('baseline.pdf')
					.cropPage(1, { width: 530, height: 210, x: 0, y: 415 })
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify same PDFs with Multiple Croppings', async () => {
				let croppings = [
					{ pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 265 } },
					{ pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 520 } },
					{ pageIndex: 1, coordinates: { width: 530, height: 210, x: 0, y: 415 } }
				];

				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('same.pdf')
					.baselinePdfFile('baseline.pdf')
					.cropPages(croppings)
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify same PDFs with Masks', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('maskedSame.pdf')
					.baselinePdfFile('baseline.pdf')
					.addMask(1, { x0: 20, y0: 40, x1: 100, y1: 70 })
					.addMask(1, { x0: 330, y0: 40, x1: 410, y1: 70 })
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify different PDFs with Masks', async () => {
				let masks = [
					{ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 } },
					{ pageIndex: 1, coordinates: { x0: 330, y0: 40, x1: 410, y1: 70 } }
				];
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('maskedNotSame.pdf')
					.baselinePdfFile('maskBaseline.pdf')
					.addMasks(masks)
					.compare();
				expect(comparisonResults.status).to.equal('failed');
				expect(comparisonResults.message).to.equal(
					'maskedNotSame.pdf is not the same as maskBaseline.pdf compared by their images.'
				);
				expect(comparisonResults.details).to.not.be.null;
			});

			it('Should be able to verify only specific page indexes', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('notSame.pdf')
					.baselinePdfFile('baseline.pdf')
					.onlyPageIndexes([1])
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to verify only specific page indexes with pdfs having different page count', async () => {
				config.settings.matchPageCount = false;
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('notSamePageCount.pdf')
					.baselinePdfFile('notSamePageCount.pdf')
					.onlyPageIndexes([0])
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});

			it('Should be able to skip specific page indexes', async () => {
				let comparisonResults = await new comparePdf(config)
					.actualPdfFile('notSame.pdf')
					.baselinePdfFile('baseline.pdf')
					.skipPageIndexes([0])
					.compare();
				expect(comparisonResults.status).to.equal('passed');
			});
		});
	}
});

describe('Compare Pdf By Base64 Tests', () => {
	before(() => {
		delete require.cache[require.resolve('./config')];
		config = require('./config');
	});

	it('Should be able to verify same PDFs', async () => {
		let comparisonResults = await new comparePdf()
			.actualPdfFile('same.pdf')
			.baselinePdfFile('baseline.pdf')
			.compare('byBase64');
		expect(comparisonResults.status).to.equal('passed');
	});

	it('Should be able to verify same PDFs using direct buffer', async () => {
		const actualPdfFilename = "same.pdf";
		const baselinePdfFilename = "baseline.pdf";
		const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
		const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

		let comparisonResults = await new comparePdf(config)
			.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
			.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
			.compare('byBase64');
		expect(comparisonResults.status).to.equal('passed');
	});

	it('Should be able to verify different PDFs', async () => {
		let comparisonResults = await new comparePdf()
			.actualPdfFile('notSame.pdf')
			.baselinePdfFile('baseline.pdf')
			.compare('byBase64');
		expect(comparisonResults.status).to.equal('failed');
		expect(comparisonResults.message).to.equal(
			'notSame.pdf is not the same as baseline.pdf compared by their base64 values.'
		);
	});

	it('Should be able to verify different PDFs using direct buffer', async () => {
		const actualPdfFilename = "notSame.pdf";
		const baselinePdfFilename = "baseline.pdf";
		const actualPdfBuffer = fs.readFileSync(`${config.paths.actualPdfRootFolder}/${actualPdfFilename}`);
		const baselinePdfBuffer = fs.readFileSync(`${config.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

		let comparisonResults = await new comparePdf(config)
			.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
			.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
			.compare('byBase64');
		expect(comparisonResults.status).to.equal('failed');
		expect(comparisonResults.message).to.equal(
			'notSame.pdf is not the same as baseline.pdf compared by their base64 values.'
		);
	});
});

describe('Compare Pdf Image Opts', () => {
	const config = require('./config');
	let comparePdfUT;

	it('Should be able to set image opts', async () => {
		let croppings = [
			{ pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 265 } },
			{ pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 520 } },
			{ pageIndex: 1, coordinates: { width: 530, height: 210, x: 0, y: 415 } }
		];

		comparePdfUT = await new comparePdf(config)
			.actualPdfFile('maskedSame.pdf')
			.baselinePdfFile('baseline.pdf')
			.cropPages(croppings)
			.addMask(1, { x0: 20, y0: 40, x1: 100, y1: 70 })
			.addMask(1, { x0: 330, y0: 40, x1: 410, y1: 70 })
			.onlyPageIndexes([0])
			.skipPageIndexes([1]);
		expect(comparePdfUT.opts).to.eql({
			masks: [
				{ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 }, color: 'black' },
				{ pageIndex: 1, coordinates: { x0: 330, y0: 40, x1: 410, y1: 70 }, color: 'black' }
			],
			crops: croppings,
			onlyPageIndexes: [0],
			skipPageIndexes: [1]
		})
	});

	it('Should be able to get different set of opts', async () => {
		comparePdfUT = await new comparePdf(config)
			.actualPdfFile('maskedSame.pdf')
			.baselinePdfFile('baseline.pdf')
			.cropPage(1, { width: 530, height: 210, x: 0, y: 415 })
			.addMask(1, { x0: 20, y0: 40, x1: 100, y1: 70 });
		expect(comparePdfUT.opts).to.eql({
			masks: [
				{ pageIndex: 1, coordinates: { x0: 20, y0: 40, x1: 100, y1: 70 }, color: 'black' },
			],
			crops: [
				{ pageIndex: 1, coordinates: { width: 530, height: 210, x: 0, y: 415 } }
			],
			onlyPageIndexes: [],
			skipPageIndexes: []
		})
	});
});