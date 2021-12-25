const fs = require("fs-extra");
const path = require("path");

const comparePdfByBase64 = async (compareDetails) => {
    const actualPdfFilename = compareDetails.actualPdfFilename;
    const baselinePdfFilename = compareDetails.baselinePdfFilename;
    const actualPdfBuffer = compareDetails.actualPdfBuffer;
    const baselinePdfBuffer = compareDetails.baselinePdfBuffer;
			
    return new Promise(async (resolve, reject) => {
        const actualPdfBaseName = path.parse(actualPdfFilename).name;
        const baselinePdfBaseName = path.parse(baselinePdfFilename).name;
        const actualPdfBase64 = Buffer.from(actualPdfBuffer).toString("base64");
        const baselinePdfBase64 = Buffer.from(baselinePdfBuffer).toString("base64");
        
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
