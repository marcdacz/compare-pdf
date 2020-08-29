const fs = require("fs-extra");
const path = require("path");

const comparePdfByBase64 = async (actualPdf, baselinePdf, config) => {
    return new Promise(async (resolve, reject) => {
        const actualPdfBaseName = path.parse(actualPdf).name;
        const baselinePdfBaseName = path.parse(baselinePdf).name;
        const actualPdfBase64 = fs.readFileSync(actualPdf, { encoding: "base64" });
        const baselinePdfBase64 = fs.readFileSync(baselinePdf, { encoding: "base64" });
        if (actualPdfBase64 !== baselinePdfBase64) {
            resolve({
                status: "failed",
                message: `${actualPdfBaseName}.pdf is not the same as ${baselinePdfBaseName}.pdf compared by their base64 values.`,
            });
        } else {
            resolve({ status: "passed" });
        }
    });
};

module.exports = {
    comparePdfByBase64,
};
