const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

/**
 *
 * @param {('graphicsMagick'|'imageMagick')} [engine=graphicsMagick]  - optional engine, Default is 'graphicsMagick'
 * @returns {{}}
 */
module.exports = function (engine = "graphicsMagick") {
	const gm = engine === "imageMagick" ? require('gm').subClass({ imageMagick: "7+" }) : require('gm');

	const module = {};

	module.pdfToPng = (pdfDetails, pngFilePath, config) => {
		const options = pdfDetails.buffer ? {data: pdfDetails.buffer} : {url: pdfDetails.filename};
		if (config.settings.hasOwnProperty('password')) options.password = config.settings.password;
		const loadingTask = pdfjsLib.getDocument(options);
		return loadingTask.promise.then((document) => {
			return new Promise((resolve, reject) => {
				const pdfBuffer = pdfDetails.buffer;
				const pdfFilename = path.parse(pdfDetails.filename).base;
				const pngFileObj = path.parse(pngFilePath);
				const multiPage = document.numPages > 1;
				const pngExtension = multiPage ? "-%d.png" : ".png"
				const pngFile = path.resolve(pngFileObj.dir, pngFileObj.name + pngExtension);

				if (config.settings.hasOwnProperty('password')) {
					gm(pdfBuffer, pdfFilename)
						.command('convert')
						.in('-authenticate', config.settings.password)
						.out(multiPage ? "+adjoin" : "-adjoin")
						.density(config.settings.density, config.settings.density)
						.quality(config.settings.quality)
						.write(pngFile, (err) => {
							if (err) return reject(err);
							return resolve();
						});
				} else {
					gm(pdfBuffer, pdfFilename)
						.command('convert')
						.out(multiPage ? "+adjoin" : "-adjoin")
						.density(config.settings.density, config.settings.density)
						.quality(config.settings.quality)
						.write(pngFile, (err) => {
							if (err) return reject(err);
							return resolve();
						});
				}
			});
		});
	};

	module.applyMask = (pngFilePath, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = 'black') => {
		return new Promise((resolve, reject) => {
			gm(pngFilePath)
				.command('convert')
				.drawRectangle(coordinates.x0, coordinates.y0, coordinates.x1, coordinates.y1)
				.fill(color)
				.write(pngFilePath, (err) => {
					err ? reject(err) : resolve();
				});
		});
	};

	module.applyCrop = (pngFilePath, coordinates = { width: 0, height: 0, x: 0, y: 0 }, index = 0) => {
		return new Promise((resolve, reject) => {
			gm(pngFilePath)
				.command('convert')
				.crop(coordinates.width, coordinates.height, coordinates.x, coordinates.y)
				.write(pngFilePath.replace('.png', `-${index}.png`), (err) => {
					err ? reject(err) : resolve();
				});
		});
	};

	return module;
};
