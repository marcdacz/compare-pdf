import { describe, it } from "node:test";
import path from "node:path";
import * as fs from "node:fs";
import * as chai from "chai";
import GraphicsMagick, {
	buildApplyCropArgs,
	buildApplyMaskArgs,
	buildPdfToPngArgs,
	getBinaryCommand
} from "../functions/engines/GraphicsMagick.js";
import { Engine } from "../functions/enums.js";

describe("GraphicsMagick CLI Adapter Tests", () => {
	it("Should use magick for the ImageMagick engine", () => {
		chai.expect(getBinaryCommand(Engine.IMAGE_MAGICK)).to.equal("magick");
	});

	it("Should use gm for the GraphicsMagick engine", () => {
		chai.expect(getBinaryCommand(Engine.GRAPHICS_MAGICK)).to.equal("gm");
	});

	it("Should build PDF conversion arguments for multiple pages", () => {
		const args = buildPdfToPngArgs({
			inputPdfPath: "/tmp/input.pdf",
			pngFilePath: "/tmp/output.png",
			density: 100,
			quality: 70,
			password: "secret",
			multiPage: true
		});

		chai
			.expect(args)
			.to.deep.equal([
				"convert",
				"-authenticate",
				"secret",
				"-density",
				"100x100",
				"-quality",
				"70",
				"/tmp/input.pdf",
				"+adjoin",
				path.resolve("/tmp", "output-%d.png")
			]);
	});

	it("Should build mask arguments", () => {
		const args = buildApplyMaskArgs({
			inputPngPath: "/tmp/input.png",
			outputPngPath: "/tmp/output.png",
			coordinates: { x0: 10, y0: 20, x1: 30, y1: 40 },
			color: "yellow"
		});

		chai
			.expect(args)
			.to.deep.equal([
				"convert",
				"/tmp/input.png",
				"-fill",
				"yellow",
				"-draw",
				"rectangle 10,20 30,40",
				"/tmp/output.png"
			]);
	});

	it("Should build crop arguments", () => {
		const args = buildApplyCropArgs({
			inputPngPath: "/tmp/input.png",
			outputPngPath: "/tmp/output-0.png",
			dimension: { width: 200, height: 100, x: 5, y: 10 }
		});

		chai.expect(args).to.deep.equal(["convert", "/tmp/input.png", "-crop", "200x100+5+10", "/tmp/output-0.png"]);
	});

	it("Should create a temporary PDF file for buffer based conversion", async () => {
		let inputPdfPath;
		const comparePdf = new GraphicsMagick(Engine.IMAGE_MAGICK, async (command, args) => {
			inputPdfPath = args[5];

			chai.expect(command).to.equal("magick");
			chai.expect(args[0]).to.equal("convert");
			chai.expect(inputPdfPath).to.match(/buffered\.pdf$/);
			chai.expect(fs.existsSync(inputPdfPath)).to.equal(true);
		});
		const buffer = fs.readFileSync(path.resolve("data/actualPdfs", "singlePage.pdf"));

		await comparePdf.pdfToPng(
			{
				filename: "buffered.pdf",
				buffer
			},
			path.resolve("data/actualPngs", "buffered", "buffered.png"),
			{
				settings: {
					density: 100,
					quality: 70,
					password: undefined
				}
			}
		);

		chai.expect(fs.existsSync(inputPdfPath)).to.equal(false);
	});
});
