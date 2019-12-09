const puppeteer = require("puppeteer");
(path = require("path")), ({ vanilla, config } = require("./utils"));

const fade_dataset = {
  path: path.resolve(__dirname, "..", "res", "CD2-fade.fna"),
  clade_index: 22
};

describe("submit fade jobs", () => {
  let browser, page;

  before(async function() {
    browser = await puppeteer.launch(config.browser);
    page = (await browser.pages())[0];
    await page.setViewport(config.viewport);
  });

  after(async function() {
    await browser.close();
  });

  it("vanilla fade with CD2 FADE", async () => {
    await vanilla("fade", fade_dataset, page);
  });
});
