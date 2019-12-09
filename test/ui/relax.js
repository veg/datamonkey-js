const puppeteer = require("puppeteer");
const { vanilla_subset, datasets, config } = require("./utils");

describe("submit relax jobs", () => {
  let browser, page;

  before(async function() {
    browser = await puppeteer.launch(config.browser);
    page = (await browser.pages())[0];
    await page.setViewport(config.viewport);
  });

  after(async function() {
    await browser.close();
  });

  it("vanilla relax with CD2 fasta", async () => {
    await vanilla_subset("relax", datasets.cd2_fasta, page);
  });

  it("vanilla relax with CD2 fna", async () => {
    await vanilla_subset("relax", datasets.cd2_fna, page);
  });

  it("vanilla relax with CD2 nexus", async () => {
    await vanilla_subset("relax", datasets.cd2_nex, page);
  });
});
