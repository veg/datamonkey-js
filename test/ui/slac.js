const puppeteer = require("puppeteer");
const { vanilla, datasets, config } = require("./utils");

describe("submit slac jobs", () => {
  let browser, page;

  before(async function() {
    browser = await puppeteer.launch(config.browser);
    page = (await browser.pages())[0];
    await page.setViewport(config.viewport);
  });

  after(async function() {
    await browser.close();
  });

  it("vanilla slac with CD2 fasta", async () => {
    await vanilla("slac", datasets.cd2_fasta, page);
  });

  it("vanilla slac with CD2 fna", async () => {
    await vanilla("slac", datasets.cd2_fna, page);
  });

  it("vanilla slac with CD2 nexus", async () => {
    await vanilla("slac", datasets.cd2_nex, page);
  });
});
