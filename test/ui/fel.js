const puppeteer = require("puppeteer");
const { vanilla_tree, vanilla_subset, datasets, config } = require("./utils");

describe("submit fel jobs", () => {
  let browser, page;

  before(async function() {
    browser = await puppeteer.launch(config.browser);
    page = (await browser.pages())[0];
    await page.setViewport(config.viewport);
  });

  after(async function() {
    await browser.close();
  });

  it("vanilla fel with CD2 fasta", async () => {
    await vanilla_tree("fel", datasets.cd2_fasta, page);
  });

  it("vanilla fel with CD2 fna", async () => {
    await vanilla_tree("fel", datasets.cd2_fna, page);
  });

  it("vanilla fel with CD2 nexus", async () => {
    await vanilla_tree("fel", datasets.cd2_nex, page);
  });

  it("fel subset selection with CD2 fasta", async () => {
    await vanilla_subset("fel", datasets.cd2_fasta, page);
  });
});
