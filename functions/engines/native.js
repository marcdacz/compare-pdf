const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const NodeCanvasFactory = require('./NodeCanvasFactory');
const fs = require('fs-extra');
const Canvas = require('canvas');

const CMAP_URL = '../../node_modules/pdfjs-dist/cmaps/';
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = '../../node_modules/pdfjs-dist/standard_fonts/';

const pdfPageToPng = async (pdfDocument, pageNumber, filename, isSinglePage = false) => {
	try {
		let page = await pdfDocument.getPage(pageNumber);
		let viewport = page.getViewport({ scale: 1.38889 });
		let canvasFactory = new NodeCanvasFactory();
		let canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
		let renderContext = {
			canvasContext: canvasAndContext.context,
			viewport: viewport,
			canvasFactory: canvasFactory
		};

		await page.render(renderContext).promise;

		let image = canvasAndContext.canvas.toBuffer();
		let pngFileName = isSinglePage ? filename : filename.replace('.png', `-${pageNumber - 1}.png`);
		fs.writeFileSync(pngFileName, image);
	} catch (error) {
		throw error;
	}
};

const pdfToPng = async (pdfDetails, pngFilePath, config) => {
	try {
		const pdfData = new Uint8Array(pdfDetails.buffer);
		const pdfDocument = await pdfjsLib.getDocument({
			disableFontFace: config.settings.hasOwnProperty('disableFontFace') ? config.settings.disableFontFace : true,
			data: pdfData,
			cMapUrl: CMAP_URL,
			cMapPacked: CMAP_PACKED,
			standardFontDataUrl: STANDARD_FONT_DATA_URL,
			verbosity: config.settings.hasOwnProperty('verbosity') ? config.settings.verbosity : 0
		}).promise;

		for (let index = 1; index <= pdfDocument.numPages; index++) {
			await pdfPageToPng(pdfDocument, index, pngFilePath, pdfDocument.numPages === 1);
		}
	} catch (error) {
		throw error;
	}
};

const applyMask = (pngFilePath, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = 'black') => {
	return new Promise((resolve, reject) => {
		const data = fs.readFileSync(pngFilePath);
		const img = new Canvas.Image();
		img.src = data;
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, img.width, img.height);
		ctx.beginPath();
		ctx.fillRect(coordinates.x0, coordinates.y0, coordinates.x1 - coordinates.x0, coordinates.y1 - coordinates.y0);
		fs.writeFileSync(pngFilePath, canvas.toBuffer());
		resolve();
	});
};

const applyCrop = (pngFilePath, coordinates = { width: 0, height: 0, x: 0, y: 0 }, index = 0) => {
	return new Promise((resolve, reject) => {
		const data = fs.readFileSync(pngFilePath);
		const img = new Canvas.Image();
		img.src = data;
		const canvas = Canvas.createCanvas(coordinates.width, coordinates.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(
			img,
			coordinates.x,
			coordinates.y,
			coordinates.width,
			coordinates.height,
			0,
			0,
			coordinates.width,
			coordinates.height
		);

		fs.writeFileSync(pngFilePath.replace('.png', `-${index}.png`), canvas.toBuffer());
		resolve();
	});
};

module.exports = {
	applyMask,
	applyCrop,
	pdfToPng
};
