module.exports = {
	paths: {
		actualPdfRootFolder: process.cwd() + '/data/actualPdfs',
		baselinePdfRootFolder: process.cwd() + '/data/baselinePdfs',
		actualPngRootFolder: process.cwd() + '/data/actualPngs',
		baselinePngRootFolder: process.cwd() + '/data/baselinePngs',
		diffPngRootFolder: process.cwd() + '/data/diffPngs'
	},
	settings: {
		imageEngine: 'graphicsMagick',
		density: 100,
		quality: 70,
		tolerance: 0,
		threshold: 0.05,
		cleanPngPaths: true,
		matchPageCount: true,
		disableFontFace: true,
		verbosity: 0
	}
};
