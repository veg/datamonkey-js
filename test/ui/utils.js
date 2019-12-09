const path = require("path"),
  setup = require("../../config/setup");

module.exports.vanilla = async (method, dataset, page) => {
  // no tree involved
  await page.goto(`http://${setup.host}:${setup.port}/${method}`);
  const file_input = await page.$("#seq-file");
  await file_input.uploadFile(dataset.path);
  await page.click("#submit-button");
  await page.waitForSelector("#summary-div", { timeout: 1000 * 60 * 60 });
  await page.waitFor(1000);
};

module.exports.vanilla_tree = async (method, dataset, page) => {
  // select all branches on the tree
  await page.goto(`http://${setup.host}:${setup.port}/${method}`);
  const file_input = await page.$("#seq-file");
  await file_input.uploadFile(dataset.path);
  await page.click("#submit-button");
  await page.waitForSelector("#tree_container");
  await page.evaluate(() => {
    document.querySelectorAll(".dropdown-menu > li > a")[0].click();
  });
  await page.click("#branch-selection-submit-button");
  await page.waitForSelector("#summary-div", { timeout: 1000 * 60 * 60 });
  await page.waitFor(1000);
};

module.exports.vanilla_subset = async (method, dataset, page) => {
  // select a clade on the tree
  await page.goto(`http://${setup.host}:${setup.port}/${method}`);
  const file_input = await page.$("#seq-file");
  await file_input.uploadFile(dataset.path);
  await page.click("#submit-button");
  await page.waitForSelector("#tree_container");
  await page.click(`g.phylotree-container :nth-child(${dataset.clade_index})`);
  await page.evaluate(() => {
    document
      .querySelectorAll("#d3_layout_phylotree_context_menu > li a")[1]
      .click();
  });
  await page.click("#branch-selection-submit-button");
  await page.waitForSelector("#summary-div", { timeout: 1000 * 60 * 60 });
};

module.exports.datasets = {
  cd2_fasta: {
    path: path.resolve(__dirname, "..", "res", "CD2-slim.fasta"),
    clade_index: 22
  },
  cd2_fna: {
    path: path.resolve(__dirname, "..", "res", "CD2-slim.fna"),
    clade_index: 16
  },
  cd2_nex: {
    path: path.resolve(__dirname, "..", "res", "CD2-slim.nex"),
    clade_index: 16
  }
};

module.exports.config = {
  browser: {
    headless: false,
    slowMo: 50,
    devtools: false,
    timeout: 24 * 60 * 60 * 1000
  },
  viewport: {
    width: 1200,
    height: 800
  }
};
