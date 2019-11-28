const comparePdf = require("../index");
const chai = require("chai");
const expect = chai.expect;

describe("Compare Pdf Common Tests", () => {
    it("Should be able to override default configs", async () => {
        let config = require("../config");
        let comparisonResults = await new comparePdf(config)
            .actualPdfFile("newSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to override specific config property", async () => {
        const ComparePdf = new comparePdf();
        ComparePdf.config.paths.actualPdfRootFolder = process.cwd() + "/data/newActualPdfs";
        let comparisonResults = await ComparePdf.actualPdfFile("newSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to throw error when passing invalid actual pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("missing.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Actual pdf file path does not exists. Please define correctly then try again."
        );
    });

    it("Should be able to throw error when not passing actual pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Actual pdf file path was not set. Please define correctly then try again."
        );
    });

    it("Should be able to throw error when passing invalid baseline pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("missing.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Baseline pdf file path does not exists. Please define correctly then try again."
        );
    });

    it("Should be able to throw error when not passing baseline pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Baseline pdf file path was not set. Please define correctly then try again."
        );
    });
});

describe("Compare Pdf By Image Tests", () => {
    it("Should be able to verify same PDFs", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify same PDFs without extension", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same")
            .baselinePdfFile("baseline")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify same PDFs using relative paths", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("../data/actualPdfs/same.pdf")
            .baselinePdfFile("../data/baselinePdfs/baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify different PDFs", async () => {
        const ComparePdf = new comparePdf();
        let comparisonResults = await ComparePdf.actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
        expect(comparisonResults.details).to.not.be.null;
    });

    it("Should be able to verify same PDFs with Masks", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("maskedSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .addMask(1, { x0: 35, y0: 70, x1: 145, y1: 95 })
            .addMask(1, { x0: 185, y0: 70, x1: 285, y1: 95 })
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify different PDFs with Masks", async () => {
        const ComparePdf = new comparePdf();
        let masks = [
            { pageIndex: 1, coordinates: { x0: 35, y0: 70, x1: 145, y1: 95 } },
            { pageIndex: 1, coordinates: { x0: 185, y0: 70, x1: 285, y1: 95 } }
        ];
        let comparisonResults = await ComparePdf.actualPdfFile("maskedNotSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .addMasks(masks)
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal("maskedNotSame.pdf is not the same as baseline.pdf.");
        expect(comparisonResults.details).to.not.be.null;
    });
});

describe("Compare Pdf By Base64 Tests", () => {
    it("Should be able to verify same PDFs", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare("byBase64");
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify different PDFs", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare("byBase64");
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal("notSame.pdf is not the same as baseline.pdf.");
    });
});
