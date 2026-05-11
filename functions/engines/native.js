const NodeCanvasFactory = require("./NodeCanvasFactory");
const fs = require("fs-extra");
const Canvas = require("canvas");

let pdfjsLibPromise;
const getPdfjsLib = () => {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsLibPromise;
};

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = "./node_modules/pdfjs-dist/standard_fonts/";

const pdfPageToPng = async (
  pdfDocument,
  canvasFactory,
  pageNumber,
  filename,
  isSinglePage = false,
) => {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.38889 });
  const canvasAndContext = canvasFactory.create(
    viewport.width,
    viewport.height,
  );
  const renderContext = {
    canvasContext: canvasAndContext.context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  const image = canvasAndContext.canvas.toBuffer();
  const pngFileName = isSinglePage
    ? filename
    : filename.replace(".png", `-${pageNumber - 1}.png`);
  fs.writeFileSync(pngFileName, image);
};

const pdfToPng = async (pdfDetails, pngFilePath, config) => {
  const pdfjsLib = await getPdfjsLib();
  const canvasFactory = new NodeCanvasFactory();
  const pdfData = new Uint8Array(pdfDetails.buffer);
  const pdfDocument = await pdfjsLib.getDocument({
    disableFontFace: config.settings.disableFontFace ?? true,
    data: pdfData,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    verbosity: config.settings.verbosity ?? 0,
    canvasFactory,
  }).promise;

  for (let index = 1; index <= pdfDocument.numPages; index++) {
    await pdfPageToPng(
      pdfDocument,
      canvasFactory,
      index,
      pngFilePath,
      pdfDocument.numPages === 1,
    );
  }
};

const applyMask = async (
  pngFilePath,
  coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 },
  color = "black",
) => {
  const data = fs.readFileSync(pngFilePath);
  const img = await Canvas.loadImage(data);
  const canvas = Canvas.createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  ctx.fillStyle = color;
  ctx.fillRect(
    coordinates.x0,
    coordinates.y0,
    coordinates.x1 - coordinates.x0,
    coordinates.y1 - coordinates.y0,
  );
  fs.writeFileSync(pngFilePath, canvas.toBuffer());
};

const applyCrop = async (
  pngFilePath,
  coordinates = { width: 0, height: 0, x: 0, y: 0 },
  index = 0,
) => {
  const data = fs.readFileSync(pngFilePath);
  const img = await Canvas.loadImage(data);
  const canvas = Canvas.createCanvas(coordinates.width, coordinates.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    img,
    coordinates.x,
    coordinates.y,
    coordinates.width,
    coordinates.height,
    0,
    0,
    coordinates.width,
    coordinates.height,
  );
  fs.writeFileSync(
    pngFilePath.replace(".png", `-${index}.png`),
    canvas.toBuffer(),
  );
};

module.exports = {
  applyMask,
  applyCrop,
  pdfToPng,
};
