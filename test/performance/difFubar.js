const request = require('supertest');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Performance testing utilities
const performanceTest = async (testFunction, iterations = 10) => {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await testFunction();
    const end = Date.now();
    times.push(end - start);
  }
  
  return {
    min: Math.min(...times),
    max: Math.max(...times),
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
  };
};

// Mock Julia backend for performance testing
const mockJuliaResponse = {
  success: true,
  sites_analyzed: 150,
  sites_with_differential_selection: 12,
  execution_time: 45.2
};

describe('DifFUBAR Performance Tests', () => {
  let app;
  
  before(function() {
    this.timeout(30000);
    
    // Mock the setup for performance testing
    process.env.NODE_ENV = 'test';
    app = require('../../server');
  });

  describe('Form Submission Performance', () => {
    it('should handle multiple concurrent submissions', async function() {
      this.timeout(60000);
      
      const testFile = path.join(__dirname, '..', 'res', 'ace2_tiny.fasta');
      const concurrentRequests = 5;
      
      const submitJob = () => {
        return new Promise((resolve, reject) => {
          request(app)
            .post('/difFubar')
            .field('gencodeid', '0')
            .field('number_of_grid_points', '20')
            .field('concentration_of_dirichlet_prior', '0.5')
            .field('mcmc_iterations', '500') // Reduced for performance test
            .field('burnin_samples', '100')
            .field('pos_threshold', '0.9')
            .field('mail', 'test@example.com')
            .attach('files', testFile)
            .end((err, res) => {
              if (err) reject(err);
              else resolve(res);
            });
        });
      };
      
      const startTime = Date.now();
      const promises = Array(concurrentRequests).fill().map(() => submitJob());
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / concurrentRequests;
      
      console.log(`Concurrent submissions: ${concurrentRequests}`);
      console.log(`Total time: ${totalTime}ms`);
      console.log(`Average time per request: ${avgTimePerRequest}ms`);
      
      // All requests should succeed
      results.forEach(result => {
        result.status.should.equal(200);
      });
      
      // Average time per request should be reasonable
      avgTimePerRequest.should.be.below(10000); // 10 seconds per request
    });

    it('should maintain performance with larger datasets', async function() {
      this.timeout(120000);
      
      // Create a larger test dataset
      const largeDataset = Array(100).fill().map((_, i) => 
        `>seq${i + 1}\nATGAAACGCATTATTGGTCTTACTTTCTTAGATCCTTTGAAGAGGACATTGCC`
      ).join('\n');
      
      const largeFastaPath = path.join(__dirname, '..', 'res', 'temp_large.fasta');
      require('fs').writeFileSync(largeFastaPath, largeDataset);
      
      const testLargeDataset = () => {
        return new Promise((resolve, reject) => {
          request(app)
            .post('/difFubar')
            .field('gencodeid', '0')
            .field('number_of_grid_points', '10') // Reduced for performance
            .field('concentration_of_dirichlet_prior', '0.5')
            .field('mcmc_iterations', '250')
            .field('burnin_samples', '50')
            .field('pos_threshold', '0.9')
            .attach('files', largeFastaPath)
            .end((err, res) => {
              if (err) reject(err);
              else resolve(res);
            });
        });
      };
      
      const performance = await performanceTest(testLargeDataset, 3);
      
      console.log('Large dataset performance:');
      console.log(`Min: ${performance.min}ms`);
      console.log(`Max: ${performance.max}ms`);
      console.log(`Avg: ${performance.avg}ms`);
      console.log(`P95: ${performance.p95}ms`);
      
      // Performance should be acceptable even for larger datasets
      performance.avg.should.be.below(30000); // 30 seconds average
      
      // Clean up
      require('fs').unlinkSync(largeFastaPath);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not cause memory leaks with repeated requests', async function() {
      this.timeout(180000);
      
      const testFile = path.join(__dirname, '..', 'res', 'ace2_tiny.fasta');
      const iterations = 20;
      
      const initialMemory = process.memoryUsage();
      
      const submitJob = () => {
        return new Promise((resolve, reject) => {
          request(app)
            .post('/difFubar')
            .field('gencodeid', '0')
            .field('number_of_grid_points', '10')
            .field('concentration_of_dirichlet_prior', '0.5')
            .field('mcmc_iterations', '250')
            .field('burnin_samples', '50')
            .field('pos_threshold', '0.9')
            .attach('files', testFile)
            .end((err, res) => {
              if (err) reject(err);
              else resolve(res);
            });
        });
      };
      
      // Run multiple iterations
      for (let i = 0; i < iterations; i++) {
        await submitJob();
        
        // Force garbage collection if possible
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreasePerRequest = memoryIncrease / iterations;
      
      console.log(`Initial memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
      console.log(`Final memory: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      console.log(`Memory per request: ${Math.round(memoryIncreasePerRequest / 1024)}KB`);
      
      // Memory increase should be reasonable
      memoryIncreasePerRequest.should.be.below(1024 * 1024); // Less than 1MB per request
    });
  });

  describe('Database Performance', () => {
    it('should handle rapid job creation and queries efficiently', async function() {
      this.timeout(60000);
      
      require('../../app/models/difFubar');
      const DifFUBAR = mongoose.model('DifFUBAR');
      
      const createJob = async () => {
        const job = new DifFUBAR({
          number_of_grid_points: 20,
          concentration_of_dirichlet_prior: 0.5,
          mcmc_iterations: 1000,
          burnin_samples: 200,
          pos_threshold: 0.9,
          tagged_nwk_tree: '((A{G1}:0.1,B{G1}:0.1):0.05,(C{G2}:0.1,D{G2}:0.1):0.05);',
          branch_sets: ['G1', 'G2']
        });
        return await job.save();
      };
      
      const queryJob = async (jobId) => {
        return await DifFUBAR.findById(jobId);
      };
      
      const numberOfJobs = 10;
      const jobs = [];
      
      // Create jobs
      const createStartTime = Date.now();
      for (let i = 0; i < numberOfJobs; i++) {
        const job = await createJob();
        jobs.push(job._id);
      }
      const createEndTime = Date.now();
      
      // Query jobs
      const queryStartTime = Date.now();
      const queryPromises = jobs.map(jobId => queryJob(jobId));
      const results = await Promise.all(queryPromises);
      const queryEndTime = Date.now();
      
      const createTime = createEndTime - createStartTime;
      const queryTime = queryEndTime - queryStartTime;
      
      console.log(`Created ${numberOfJobs} jobs in ${createTime}ms`);
      console.log(`Queried ${numberOfJobs} jobs in ${queryTime}ms`);
      console.log(`Average create time: ${createTime / numberOfJobs}ms`);
      console.log(`Average query time: ${queryTime / numberOfJobs}ms`);
      
      // All queries should succeed
      results.length.should.equal(numberOfJobs);
      results.forEach(result => {
        result.should.not.be.null();
      });
      
      // Performance should be acceptable
      (createTime / numberOfJobs).should.be.below(1000); // Less than 1 second per create
      (queryTime / numberOfJobs).should.be.below(100); // Less than 100ms per query
      
      // Clean up
      await DifFUBAR.deleteMany({ _id: { $in: jobs } });
    });
  });

  describe('Load Testing', () => {
    it('should handle sustained load without degradation', async function() {
      this.timeout(300000); // 5 minutes
      
      const testFile = path.join(__dirname, '..', 'res', 'ace2_tiny.fasta');
      const requestsPerWave = 3;
      const numberOfWaves = 5;
      const waveInterval = 10000; // 10 seconds between waves
      
      const submitWave = async () => {
        const promises = Array(requestsPerWave).fill().map(() => {
          return new Promise((resolve, reject) => {
            request(app)
              .post('/difFubar')
              .field('gencodeid', '0')
              .field('number_of_grid_points', '10')
              .field('concentration_of_dirichlet_prior', '0.5')
              .field('mcmc_iterations', '250')
              .field('burnin_samples', '50')
              .field('pos_threshold', '0.9')
              .attach('files', testFile)
              .end((err, res) => {
                if (err) reject(err);
                else resolve({ time: Date.now(), status: res.status });
              });
          });
        });
        
        return await Promise.all(promises);
      };
      
      const waveTimes = [];
      
      for (let wave = 0; wave < numberOfWaves; wave++) {
        const waveStart = Date.now();
        const results = await submitWave();
        const waveEnd = Date.now();
        
        const waveTime = waveEnd - waveStart;
        waveTimes.push(waveTime);
        
        console.log(`Wave ${wave + 1}: ${waveTime}ms, ${results.length} requests completed`);
        
        // All requests in wave should succeed
        results.forEach(result => {
          result.status.should.equal(200);
        });
        
        // Wait before next wave
        if (wave < numberOfWaves - 1) {
          await new Promise(resolve => setTimeout(resolve, waveInterval));
        }
      }
      
      // Performance should not degrade significantly over time
      const firstWaveTime = waveTimes[0];
      const lastWaveTime = waveTimes[waveTimes.length - 1];
      const degradation = (lastWaveTime - firstWaveTime) / firstWaveTime;
      
      console.log(`First wave: ${firstWaveTime}ms`);
      console.log(`Last wave: ${lastWaveTime}ms`);
      console.log(`Performance degradation: ${Math.round(degradation * 100)}%`);
      
      // Should not degrade by more than 50%
      degradation.should.be.below(0.5);
    });
  });
});