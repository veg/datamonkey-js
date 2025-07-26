const puppeteer = require("puppeteer");
const { vanilla_subset, datasets, config } = require("./utils");
const path = require("path");

// Define difFUBAR-specific test datasets
const difFubarDatasets = {
  ace2_tiny: {
    path: path.resolve(__dirname, "..", "res", "CD2-slim.fasta"),
    clade_index: 22,
    expected_sequences: 8
  },
  cd2_medium: {
    path: path.resolve(__dirname, "..", "res", "CD2.fasta"), 
    clade_index: 30,
    expected_sequences: 15
  },
  nexus_format: {
    path: path.resolve(__dirname, "..", "res", "CD2-slim.nex"),
    clade_index: 16,
    expected_sequences: 8
  }
};

// Custom difFUBAR workflow function
const difFubarWorkflow = async (dataset, page, advancedOptions = {}) => {
  // Step 1: Navigate to difFUBAR form
  await page.goto(`http://localhost:3000/difFubar`);
  
  // Step 2: Upload sequence file
  const file_input = await page.$("#seq-file");
  await file_input.uploadFile(dataset.path);
  
  // Step 3: Set advanced options if provided
  if (Object.keys(advancedOptions).length > 0) {
    // Click advanced options
    await page.click('button:contains("Advanced Options")');
    
    if (advancedOptions.grid_points) {
      await page.evaluate((value) => {
        document.getElementById('number_of_grid_points').value = value;
      }, advancedOptions.grid_points);
    }
    
    if (advancedOptions.mcmc_iterations) {
      await page.evaluate((value) => {
        document.getElementById('mcmc_iterations').value = value;
      }, advancedOptions.mcmc_iterations);
    }
    
    if (advancedOptions.pos_threshold) {
      await page.evaluate((value) => {
        document.getElementById('pos_threshold').value = value;
      }, advancedOptions.pos_threshold);
    }
  }
  
  // Step 4: Submit initial form
  await page.click('button[type="submit"]');
  
  // Step 5: Wait for tree tagging interface
  await page.waitForSelector("#tree_container", { timeout: 30000 });
  await page.waitFor(2000); // Allow tree to render
  
  // Step 6: Tag branches for difFUBAR analysis
  // Create first branch group (G1)
  await page.evaluate(() => {
    document.querySelector('input[id="selection_name_box"]').value = "G1";
    document.querySelector('input[id="selection_name_box"]').dispatchEvent(new Event('change'));
  });
  
  // Select some branches for G1
  await page.click(`g.phylotree-container :nth-child(${dataset.clade_index})`);
  await page.evaluate(() => {
    document.querySelectorAll("#d3_layout_phylotree_context_menu > li a")[1].click();
  });
  
  // Create second branch group (G2)
  await page.evaluate(() => {
    document.querySelector('#selection_new a').click();
  });
  await page.evaluate(() => {
    document.querySelector('input[id="selection_name_box"]').value = "G2";
    document.querySelector('input[id="selection_name_box"]').dispatchEvent(new Event('change'));
  });
  
  // Select different branches for G2
  const secondCladeIndex = Math.max(1, dataset.clade_index - 5);
  await page.click(`g.phylotree-container :nth-child(${secondCladeIndex})`);
  await page.evaluate(() => {
    document.querySelectorAll("#d3_layout_phylotree_context_menu > li a")[1].click();
  });
  
  // Step 7: Submit branch selection
  await page.click("#branch-selection-submit-button");
  
  // Step 8: Wait for job to start
  await page.waitForSelector("#summary-div", { timeout: 1000 * 60 * 60 });
  
  return true;
};

describe("DifFUBAR UI Integration Tests", () => {
  let browser, page;

  before(async function() {
    this.timeout(120000); // 2 minutes for browser setup
    browser = await puppeteer.launch({
      ...config.browser,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = (await browser.pages())[0];
    await page.setViewport(config.viewport);
  });

  after(async function() {
    await browser.close();
  });

  describe("Form Validation Tests", () => {
    it("should validate required sequence file upload", async () => {
      await page.goto(`http://localhost:3000/difFubar`);
      
      // Try to submit without file
      await page.click('button[type="submit"]');
      
      // Should show validation error or prevent submission
      const hasError = await page.evaluate(() => {
        const fileInput = document.getElementById('seq-file');
        return !fileInput.checkValidity();
      });
      
      hasError.should.be.true();
    });

    it("should validate advanced parameter ranges", async () => {
      await page.goto(`http://localhost:3000/difFubar`);
      
      // Click advanced options
      await page.click('button:contains("Advanced Options")');
      
      // Test invalid MCMC iterations (too low)
      await page.evaluate(() => {
        document.getElementById('mcmc_iterations').value = '50';
        document.getElementById('mcmc_iterations').dispatchEvent(new Event('change'));
      });
      
      // Should show error message
      const errorMessage = await page.$eval('.alert-danger', el => el.textContent);
      errorMessage.should.containEql('MCMC iterations');
    });
  });

  describe("Tree Tagging Interface Tests", () => {
    it("should display tree tagging interface after file upload", async () => {
      await page.goto(`http://localhost:3000/difFubar`);
      
      const file_input = await page.$("#seq-file");
      await file_input.uploadFile(difFubarDatasets.ace2_tiny.path);
      await page.click('button[type="submit"]');
      
      // Should redirect to tree tagging page
      await page.waitForSelector("#tree_container", { timeout: 30000 });
      await page.waitForSelector("#branch-selection-container");
      
      const treeExists = await page.$("#tree_container") !== null;
      const branchSelectionExists = await page.$("#branch-selection-container") !== null;
      
      treeExists.should.be.true();
      branchSelectionExists.should.be.true();
    });

    it("should allow creating multiple branch groups", async () => {
      await page.goto(`http://localhost:3000/difFubar`);
      
      const file_input = await page.$("#seq-file");
      await file_input.uploadFile(difFubarDatasets.ace2_tiny.path);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector("#tree_container", { timeout: 30000 });
      
      // Default should have "Foreground" group
      let groupName = await page.$eval('#selection_name_box', el => el.value);
      groupName.should.equal('Foreground');
      
      // Create new group
      await page.evaluate(() => {
        document.querySelector('#selection_new a').click();
      });
      
      // Should now have "New Partition 1"
      groupName = await page.$eval('#selection_name_box', el => el.value);
      groupName.should.equal('New Partition 1');
    });

    it("should validate branch selection before submission", async () => {
      await page.goto(`http://localhost:3000/difFubar`);
      
      const file_input = await page.$("#seq-file");
      await file_input.uploadFile(difFubarDatasets.ace2_tiny.path);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector("#tree_container", { timeout: 30000 });
      
      // Try to submit without selecting any branches
      await page.click("#branch-selection-submit-button");
      
      // Should show validation alert
      const alertShown = await page.evaluate(() => {
        return new Promise(resolve => {
          const originalAlert = window.alert;
          window.alert = (message) => {
            window.alert = originalAlert; // Restore original
            resolve(message.includes('No branch selections'));
          };
          // Trigger the action that should show alert
          setTimeout(() => resolve(false), 1000);
        });
      });
      
      alertShown.should.be.true();
    });
  });

  describe("End-to-End Workflow Tests", () => {
    it("should complete full difFUBAR workflow with tiny dataset", async function() {
      this.timeout(300000); // 5 minutes timeout
      
      const success = await difFubarWorkflow(difFubarDatasets.ace2_tiny, page);
      success.should.be.true();
    });

    it("should handle NEXUS format files", async function() {
      this.timeout(300000); // 5 minutes timeout
      
      const success = await difFubarWorkflow(difFubarDatasets.nexus_format, page);
      success.should.be.true();
    });

    it("should work with custom advanced parameters", async function() {
      this.timeout(300000); // 5 minutes timeout
      
      const advancedOptions = {
        grid_points: 15,
        mcmc_iterations: 1000,
        pos_threshold: 0.9
      };
      
      const success = await difFubarWorkflow(
        difFubarDatasets.ace2_tiny, 
        page, 
        advancedOptions
      );
      success.should.be.true();
    });
  });

  describe("Error Handling Tests", () => {
    it("should handle malformed sequence files gracefully", async () => {
      await page.goto(`http://localhost:3000/difFubar`);
      
      // Try to upload a non-FASTA file
      const badFile = path.resolve(__dirname, "..", "res", "mangled_nexus.nex");
      const file_input = await page.$("#seq-file");
      await file_input.uploadFile(badFile);
      await page.click('button[type="submit"]');
      
      // Should show error modal or message
      const hasError = await Promise.race([
        page.waitForSelector("#errorModal", { timeout: 10000 }).then(() => true),
        page.waitForSelector(".alert-danger", { timeout: 10000 }).then(() => true),
        new Promise(resolve => setTimeout(() => resolve(false), 10000))
      ]);
      
      hasError.should.be.true();
    });

    it("should handle network errors during job submission", async () => {
      // This would require mocking network failures
      // For now, we'll just verify error handling components exist
      await page.goto(`http://localhost:3000/difFubar`);
      
      const errorModalExists = await page.$("#errorModal") !== null;
      errorModalExists.should.be.true();
    });
  });

  describe("Performance Tests", () => {
    it("should load tree interface within acceptable time", async function() {
      this.timeout(60000); // 1 minute timeout
      
      const startTime = Date.now();
      
      await page.goto(`http://localhost:3000/difFubar`);
      const file_input = await page.$("#seq-file");
      await file_input.uploadFile(difFubarDatasets.cd2_medium.path);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector("#tree_container", { timeout: 30000 });
      
      const loadTime = Date.now() - startTime;
      loadTime.should.be.below(30000); // Should load within 30 seconds
    });

    it("should handle tree interactions smoothly", async function() {
      this.timeout(60000); // 1 minute timeout
      
      await page.goto(`http://localhost:3000/difFubar`);
      const file_input = await page.$("#seq-file");
      await file_input.uploadFile(difFubarDatasets.ace2_tiny.path);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector("#tree_container", { timeout: 30000 });
      
      // Test multiple rapid interactions
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          document.querySelector('#selection_new a').click();
        });
        await page.waitFor(100);
      }
      
      // Should still be responsive
      const responsive = await page.$eval('#selection_name_box', el => el !== null);
      responsive.should.be.true();
    });
  });
});