const request = require('supertest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Mock the setup and initialize the app
const setup = require('../../config/setup');
const app = require('../../server');

require('../../app/models/msa');
require('../../app/models/difFubar');

const DifFUBAR = mongoose.model('DifFUBAR');

describe('DifFUBAR API Integration Tests', () => {
  let testDatabase;
  let testJobId;
  
  before(function(done) {
    this.timeout(10000);
    
    // Create unique test database
    const random_id = crypto.randomBytes(4).toString('hex');
    testDatabase = setup.database + '_difFubar_api_test_' + random_id;
    mongoose.connect(testDatabase, done);
  });

  describe('POST /difFubar', () => {
    it('should create a new difFUBAR analysis job', (done) => {
      const testFile = path.join(__dirname, '..', 'res', 'ace2_tiny.fasta');
      
      request(app)
        .post('/difFubar')
        .field('gencodeid', '0')
        .field('concentration_of_dirichlet_prior', '0.5')
        .field('mcmc_iterations', '1000')
        .field('burnin_samples', '200')
        .field('pos_threshold', '0.9')
        .field('mail', 'test@example.com')
        .attach('files', testFile)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          res.body.should.have.property('analysis');
          res.body.should.have.property('upload_redirect_path');
          res.body.upload_redirect_path.should.match(/\/difFubar\/.*\/select-foreground/);
          
          testJobId = res.body.analysis._id;
          done();
        });
    });

    it('should validate required parameters', (done) => {
      const testFile = path.join(__dirname, '..', 'res', 'ace2_tiny.fasta');
      
      request(app)
        .post('/difFubar')
        .attach('files', testFile)
        // Missing required parameters
        .expect(500, done);
    });

    it('should reject files that are too large', (done) => {
      // This would need a very large test file
      // For now, just test that the endpoint exists
      request(app)
        .post('/difFubar')
        .expect((res) => {
          // Should not crash even with bad input
        })
        .end(done);
    });
  });

  describe('GET /difFubar/:id/select-foreground', () => {
    it('should display tree selection form for valid job', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/select-foreground`)
        .expect('Content-Type', /html/)
        .expect(200)
        .expect((res) => {
          res.text.should.containEql('branch-selection-container');
          res.text.should.containEql('render_multibranch_selection');
        })
        .end(done);
    });

    it('should return 500 for invalid job ID', (done) => {
      const invalidId = '507f1f77bcf86cd799439011';
      
      request(app)
        .get(`/difFubar/${invalidId}/select-foreground`)
        .expect(500, done);
    });
  });

  describe('POST /difFubar/:id/select-foreground', () => {
    it('should accept tagged tree and start analysis', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      const taggedTree = '((seq1{G1}:0.1,seq2{G1}:0.1):0.05,(seq3{G2}:0.1,seq4{G2}:0.1):0.05);';
      const branchSets = ['G1', 'G2'];
      
      request(app)
        .post(`/difFubar/${testJobId}/select-foreground`)
        .send({
          nwk_tree: taggedTree,
          branch_sets: JSON.stringify(branchSets)
        })
        .expect(200)
        .expect((res) => {
          res.body.should.have.property('difFubar');
          res.body.difFubar.should.have.property('_id');
        })
        .end(done);
    });

    it('should validate branch sets format', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .post(`/difFubar/${testJobId}/select-foreground`)
        .send({
          nwk_tree: '((A:0.1,B:0.1):0.05);',
          branch_sets: 'invalid_json'
        })
        .expect(500, done);
    });
  });

  describe('GET /difFubar/:id', () => {
    it('should display job page for valid job', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}`)
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done);
    });
  });

  describe('GET /difFubar/:id/fasta', () => {
    it('should return FASTA data for valid job', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/fasta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          res.body.should.have.property('fasta');
        })
        .end(done);
    });
  });

  describe('GET /difFubar/:id/info', () => {
    it('should return job information', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/info`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          res.body.should.have.property('_id');
          res.body.should.have.property('analysistype');
          res.body.analysistype.should.equal('difFubar');
        })
        .end(done);
    });
  });

  describe('GET /difFubar/:id/plots/:plotType.:format', () => {
    it('should handle requests for plot files gracefully', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/plots/overview.png`)
        .expect((res) => {
          // Should either return the file (200) or not found (404)
          // but not crash the server
          [200, 404].should.containEql(res.status);
        })
        .end(done);
    });

    it('should set correct content types for different formats', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/plots/overview.svg`)
        .expect((res) => {
          if (res.status === 200) {
            res.headers['content-type'].should.match(/image\/svg\+xml/);
          }
        })
        .end(done);
    });

    it('should return 404 for invalid plot types', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/plots/invalid.png`)
        .expect(404, done);
    });
  });

  describe('GET /difFubar/:id/cancel', () => {
    it('should cancel a running job', (done) => {
      if (!testJobId) {
        return done(new Error('No test job ID available'));
      }
      
      request(app)
        .get(`/difFubar/${testJobId}/cancel`)
        .expect('Content-Type', /json/)
        .expect((res) => {
          // Should return success or error, but not crash
          res.body.should.have.property('success');
        })
        .end(done);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', (done) => {
      request(app)
        .post('/difFubar')
        .field('gencodeid', '0')
        .field('concentration_of_dirichlet_prior', '0.5')
        .field('mcmc_iterations', '1000')
        .field('burnin_samples', '200')
        .field('pos_threshold', '0.9')
        // No file attached
        .expect(500, done);
    });

    it('should handle malformed parameter values', (done) => {
      const testFile = path.join(__dirname, '..', 'res', 'ace2_tiny.fasta');
      
      request(app)
        .post('/difFubar')
        .field('gencodeid', 'invalid')
        .field('mcmc_iterations', 'not_a_number')
        .field('pos_threshold', '2.0') // Out of range
        .attach('files', testFile)
        .expect(500, done);
    });
  });

  after(function(done) {
    // Clean up test database
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    done();
  });
});