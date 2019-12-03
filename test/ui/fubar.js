const puppeteer = require("puppeteer"),
  path = require("path"),
  setup = require("../../config/setup");

describe("submit fubar jobs", () => {
  let browser, page;

  before(async function() {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      devtools: false,
      timeout: 100000
    });
    page = (await browser.pages())[0];
    await page.setViewport({
      width: 1200,
      height: 800
    });
  });

  after(async function() {
    await browser.close();
  });

  it("vanilla fubar with CD2", async done => {
    await page.goto(`http://${setup.host}:${setup.port}/fubar`);
    const file_input = await page.$("#seq-file");
    const cd2_path = path.resolve(__dirname, "..", "res", "CD2.fasta");
    await file_input.uploadFile(cd2_path);
    await page.click("#submit-button");
    await page.waitForSelector("#summary-div", { timeout: 100000 });
    await page.waitFor(1000);
    done();
  });
});
