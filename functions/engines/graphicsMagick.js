const gm = require("gm");
const path = require("path");
const { execSync } = require("child_process");

let detectedImageMagick;
const detectImageMagick = () => {
  if (detectedImageMagick !== undefined) return detectedImageMagick;
  try {
    execSync("magick --version", { stdio: "ignore" });
    detectedImageMagick = "7+";
  } catch {
    detectedImageMagick = true;
  }
  return detectedImageMagick;
};

const resolveImageMagick = (config) => {
  const configured = config.settings.imageMagickVersion;
  if (configured === "7+") return "7+";
  if (configured === "6") return true;
  return detectImageMagick();
};

const getGm = (config) =>
  gm.subClass({ imageMagick: resolveImageMagick(config) });

const pdfToPng = (pdfDetails, pngFilePath, config) => {
  return new Promise((resolve, reject) => {
    const pdfBuffer = pdfDetails.buffer;
    const pdfFilename = path.parse(pdfDetails.filename).name;

    getGm(config)(pdfBuffer, pdfFilename)
      .density(config.settings.density, config.settings.density)
      .quality(config.settings.quality)
      .write(pngFilePath, (err) => {
        err ? reject(err) : resolve();
      });
  });
};

const applyMask = (
  pngFilePath,
  coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 },
  color = "black",
  config,
) => {
  return new Promise((resolve, reject) => {
    getGm(config)(pngFilePath)
      .drawRectangle(
        coordinates.x0,
        coordinates.y0,
        coordinates.x1,
        coordinates.y1,
      )
      .fill(color)
      .write(pngFilePath, (err) => {
        err ? reject(err) : resolve();
      });
  });
};

const applyCrop = (
  pngFilePath,
  coordinates = { width: 0, height: 0, x: 0, y: 0 },
  index = 0,
  config,
) => {
  return new Promise((resolve, reject) => {
    getGm(config)(pngFilePath)
      .crop(coordinates.width, coordinates.height, coordinates.x, coordinates.y)
      .write(pngFilePath.replace(".png", `-${index}.png`), (err) => {
        err ? reject(err) : resolve();
      });
  });
};

module.exports = {
  applyMask,
  applyCrop,
  pdfToPng,
};
