describe("ToDo React", () => {
    before(() => {});

    it("should show the correct page title", async () => {
        cy.task("pdfCompare", {
            actualPdf: "actualPdf.pdf",
            baselinePdf: "baselinePdf.pdf"
        }).then((result) => {
            expect(result.status).to.equal("passed");
        });
    });
});
