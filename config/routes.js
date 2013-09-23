/*
  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//Routes

module.exports = function(app){

  // HOME PAGE
  home = require( ROOT_PATH + '/app/routes/home');
  app.get('/', home.homePage);
  app.get('/help', home.help);
  app.get('/jobqueue', home.jobQueue);
  app.get('/stats', home.stats);
  app.get('/stats_test', home.stats_test);

  // UPLOAD FILE ROUTES
  msa = require( ROOT_PATH + '/app/routes/msa');
  app.get('/msa', msa.showUploadForm);
  app.post('/msa', msa.uploadMsa);
  app.get('/msa/:id', msa.findById);
  app.put('/msa/:id', msa.updateMsa);
  app.delete('/msa/:id', msa.deleteMsa);

  // ANALYSIS ROUTES
  analysis = require( ROOT_PATH + '/app/routes/analysis');
  app.get('/msa/:msaid/createanalysis', analysis.createForm);
  app.post('/msa/:msaid/:type', analysis.invokeJob);
  app.get('/msa/:msaid/:type/:analysisid', analysis.getAnalysis);
  app.get('/msa/:msaid/:type/:analysisid/status', analysis.queryStatus);
  app.delete('/msa/:msaid/:type/:analysisid', analysis.deleteAnalysis);

  // STATS ROUTES
  stats = require( ROOT_PATH + '/app/routes/stats');
  app.get('/:type/usage', stats.usageStatistics);

  // HIV CLUSTERING ROUTES
  hivcluster = require( ROOT_PATH + '/app/routes/hivcluster');
  app.get('/hivcluster', hivcluster.clusterForm);
  app.post('/hivcluster', hivcluster.invokeClusterAnalysis);
  app.get('/hivcluster/:id', hivcluster.jobPage);
  app.get('/hivcluster/:id/results', hivcluster.results);
}

