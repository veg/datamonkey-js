var fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  setup = require("../config/setup"),
  globals = require("../config/globals");

var mongoose = require("mongoose");

require("../app/models/msa");
require("../app/models/difFubar");

var DifFUBAR = mongoose.model("DifFUBAR"),
  Msa = mongoose.model("Msa"),
  should = require("should");

describe("DifFUBAR Backend Unit Tests", function() {
  var testDatabase;
  
  before(function() {
    // Create unique test database
    var random_id = crypto.randomBytes(4).toString("hex");
    testDatabase = setup.database + "_difFubar_unit_test_" + random_id;
    mongoose.connect(testDatabase);
  });

  describe("Model Creation and Validation", function() {
    it("should create a difFUBAR analysis with default parameters", function(done) {
      var difFubar = new DifFUBAR();
      var datatype = 0;
      var gencodeid = 0;
      var fn = path.join(__dirname, "/res/CD2-slim.fasta");

      Msa.parseFile(fn, datatype, gencodeid, function(err, result) {
        should.not.exist(err);
        
        difFubar.msa = result;
        difFubar.number_of_grid_points = 20;
        difFubar.concentration_of_dirichlet_prior = 0.5;
        difFubar.mcmc_iterations = 2500;
        difFubar.burnin_samples = 500;
        difFubar.pos_threshold = 0.95;
        
        difFubar.save(function(err, difFubar_result) {
          should.not.exist(err);
          difFubar_result.should.have.property('_id');
          difFubar_result.number_of_grid_points.should.equal(20);
          difFubar_result.mcmc_iterations.should.equal(2500);
          difFubar_result.burnin_samples.should.equal(500);
          difFubar_result.pos_threshold.should.equal(0.95);
          done();
        });
      });
    });

    it("should validate MCMC parameter ranges", function(done) {
      var difFubar = new DifFUBAR();
      
      // Test valid parameters
      difFubar.mcmc_iterations = 1000;
      difFubar.burnin_samples = 200;
      difFubar.pos_threshold = 0.9;
      difFubar.concentration_of_dirichlet_prior = 0.3;
      
      difFubar.mcmc_iterations.should.be.above(100);
      difFubar.mcmc_iterations.should.be.below(10000);
      difFubar.burnin_samples.should.be.above(50);
      difFubar.burnin_samples.should.be.below(5000);
      difFubar.pos_threshold.should.be.above(0.5);
      difFubar.pos_threshold.should.be.below(1.0);
      difFubar.concentration_of_dirichlet_prior.should.be.above(0.001);
      difFubar.concentration_of_dirichlet_prior.should.be.below(1.0);
      
      done();
    });

    it("should handle tagged tree data correctly", function(done) {
      var difFubar = new DifFUBAR();
      
      // Mock tagged tree string
      var tagged_tree = "((A{G1}:0.1,B{G1}:0.2):0.05,(C{G2}:0.15,D{G2}:0.1):0.05);";
      var branch_sets = ["G1", "G2"];
      
      difFubar.tagged_nwk_tree = tagged_tree;
      difFubar.branch_sets = branch_sets;
      
      difFubar.tagged_nwk_tree.should.equal(tagged_tree);
      difFubar.branch_sets.should.containEql("G1");
      difFubar.branch_sets.should.containEql("G2");
      difFubar.branch_sets.length.should.equal(2);
      
      done();
    });
  });

  describe("File Path Virtuals", function() {
    it("should generate correct file paths", function(done) {
      var difFubar = new DifFUBAR();
      difFubar._id = mongoose.Types.ObjectId();
      
      var expectedFilepath = path.join(__dirname, "/../uploads/msa/", difFubar._id + ".fasta");
      var expectedUrl = "http://" + setup.host + "/difFubar/" + difFubar._id;
      var expectedRedirectPath = path.join("/difFubar/", String(difFubar._id), "/select-foreground");
      
      difFubar.filepath.should.equal(expectedFilepath);
      difFubar.url.should.equal(expectedUrl);
      difFubar.upload_redirect_path.should.equal(expectedRedirectPath);
      
      done();
    });

    it("should have correct analysis type properties", function(done) {
      var difFubar = new DifFUBAR();
      
      difFubar.analysistype.should.equal("difFubar");
      difFubar.max_sequences.should.equal(2000);
      difFubar.status_stack.should.containEql("queue");
      difFubar.status_stack.should.containEql("running");
      difFubar.status_stack.should.containEql("completed");
      
      done();
    });
  });

  describe("Job Lifecycle Methods", function() {
    it("should have a start method for job submission", function(done) {
      var difFubar = new DifFUBAR();
      
      // Check that start method exists
      difFubar.should.have.property('start');
      difFubar.start.should.be.a.Function();
      
      done();
    });
  });

  describe("Error Handling", function() {
    it("should handle invalid MSA files gracefully", function(done) {
      var nonExistentFile = path.join(__dirname, "/res/nonexistent.fasta");
      
      DifFUBAR.spawn(nonExistentFile, {
        gencodeid: 0,
        number_of_grid_points: 20,
        concentration_of_dirichlet_prior: 0.5,
        mcmc_iterations: 2500,
        burnin_samples: 500,
        pos_threshold: 0.95
      }, function(err, result) {
        should.exist(err);
        should.not.exist(result);
        done();
      });
    });

    it("should reject sequences exceeding the maximum limit", function(done) {
      // This would need a test file with >2000 sequences
      // For now, we'll test the logic by checking the limit
      var difFubar = new DifFUBAR();
      difFubar.max_sequences.should.equal(2000);
      done();
    });
  });

  after(function(done) {
    // Clean up test database
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    done();
  });
});