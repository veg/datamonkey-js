/*
  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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


var path = require('path');

module.exports = function(app) {

  // HOME PAGE
  home = require(path.join(__dirname, '../app/routes/home'));
  app.get('/', home.homePage);
  app.get('/help', home.help);
  app.get('/jobqueue', home.jobQueue);
  app.get('/stats', home.stats);
  app.get('/clusterhealth', home.clusterhealth);
  app.get('/stats_test', home.stats_test);
  app.get('/analyses', home.analyses);
  app.get('/treeviewer', home.treeviewer);
  app.get('/development', home.development);
  app.get('/copyright_notice', home.copyright);
  app.get('/uploads', home.data_privacy);
  
  // BUSTED ROUTES
  busted = require(path.join(__dirname, '../app/routes/busted'));
  app.get('/busted', busted.createForm);
  app.post('/busted/uploadfile', busted.uploadFile);
  app.get('/busted/:id/select-foreground', busted.selectForeground);
  app.post('/busted/:id/select-foreground', busted.invokeBusted);
  app.get('/busted/:bustedid', busted.getPage);
  app.get('/busted/:bustedid/info', busted.getInfo);
  app.get('/busted/:bustedid/cancel', busted.cancel);
  app.get('/busted/:bustedid/results', busted.getResults);
  app.get('/busted/:bustedid/log.txt', busted.getLog);
  //busted.resubscribePendingJobs();

  // RELAX ROUTES
  relax = require(path.join(__dirname, '../app/routes/relax'));
  app.get('/relax', relax.createForm);
  app.post('/relax/uploadfile', relax.uploadFile);
  app.get('/relax/:id/select-foreground', relax.selectForeground);
  app.post('/relax/:id/select-foreground', relax.invokeRelax);
  app.get('/relax/:id', relax.getPage);
  app.get('/relax/:id/info', relax.getInfo);
  app.get('/relax/:id/cancel', relax.cancel);
  app.get('/relax/:id/restart', relax.restart);
  app.get('/relax/:id/results', relax.getResults);
  app.get('/relax/:id/recheck', relax.getRecheck);
  app.get('/relax/:id/log.txt', relax.getLog);
  relax.resubscribePendingJobs();

  // aBSREL ROUTES
  absrel = require(path.join(__dirname, '../app/routes/absrel'));
  app.get('/absrel', absrel.form);
  app.post('/absrel', absrel.invoke);
  app.get('/absrel/:id', absrel.getPage);
  app.get('/absrel/:id/info', absrel.getInfo);
  app.get('/absrel/:id/results', absrel.getResults);
  app.get('/absrel/:id/cancel', absrel.cancel);
  app.get('/absrel/:id/log.txt', absrel.getLog);
  absrel.resubscribePendingJobs();

  // HIV TRACE ROUTES
  hivtrace = require(path.join(__dirname, '../app/routes/hivtrace'));
  app.get('/hivtrace', hivtrace.clusterForm);
  app.post('/hivtrace/uploadfile', hivtrace.uploadFile);
  app.get('/hivtrace/:id/map-attributes', hivtrace.mapAttributes);
  app.post('/hivtrace/:id/save-attributes', hivtrace.saveAttributes);
  app.post('/hivtrace/invoke/:id', hivtrace.invokeClusterAnalysis);
  app.get('/hivtrace/:id', hivtrace.jobPage);
  app.get('/hivtrace/:id/results', hivtrace.results);
  app.get('/hivtrace/:id/trace_results', hivtrace.trace_results);
  app.get('/hivtrace/:id/lanl_trace_results', hivtrace.lanl_trace_results);
  app.get('/hivtrace/:id/settings', hivtrace.settings);
  app.get('/hivtrace/:id/attributes', hivtrace.attributeMap);
  app.get('/hivtrace/:id/aligned.fasta', hivtrace.aligned_fasta);

  // FLEA ROUTES
  flea = require(path.join(__dirname, '../app/routes/flea'));
  app.get('/flea', flea.form);
  app.post('/flea', flea.invoke);
  app.get('/flea/:id', flea.getPage);
  app.get('/flea/:id/restart', flea.restart);
  app.get('/flea/data/:id/results', flea.getResults);
  app.get('/flea/data/:id/rates', flea.getRates);
  app.get('/flea/data/:id/frequencies', flea.getFrequencies);
  app.get('/flea/data/:id/sequences', flea.getSequences);
  app.get('/flea/data/:id/rates_pheno', flea.getRatesPheno);
  app.get('/flea/data/:id/trees', flea.getTrees);
  app.get('/flea/data/:id/neutralization', flea.getNeutralization);
  app.get('/flea/data/:id/turnover', flea.getTurnover);
  app.get('/flea/data/:id/copynumbers', flea.getCopyNumbers);

}
