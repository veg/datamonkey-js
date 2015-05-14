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

//Routes

module.exports = function(app) {

  // HOME PAGE
  home = require( ROOT_PATH + '/app/routes/home');
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
  
  // UPLOAD FILE ROUTES
  msa = require( ROOT_PATH + '/app/routes/msa');
  app.get('/msa', msa.showUploadForm);
  app.post('/msa/uploadfile', msa.uploadFile);
  app.get('/msa/:id/map-attributes', msa.mapAttributes);
  app.post('/msa/:id/save-attributes', msa.saveAttributes);
  app.get('/msa/:id', msa.findById);
  app.get('/msa/:id/nj', msa.getNeighborJoin);
  app.get('/msa/:id/aa', msa.aminoAcidTranslation);
  app.get('/msa/:id/aa/view', msa.aminoAcidTranslationViewer);
  app.get('/msa/:id/attributes', msa.attributeMap);

  //// PRIME ROUTES
  //prime = require( ROOT_PATH + '/app/routes/prime');
  //app.get('/msa/:msaid/prime', prime.createForm);
  //app.post('/msa/:msaid/prime', prime.invokePrime);
  //app.get('/msa/:msaid/prime/:primeid/status', prime.getStatus);
  //app.get('/msa/:msaid/prime/:primeid', prime.getPrime);
  //app.delete('/msa/:msaid/prime/:primeid', prime.deletePrime);

  // BUSTED ROUTES
  busted = require( ROOT_PATH + '/app/routes/busted');
  app.get('/busted', busted.createForm);
  app.post('/busted/uploadfile', busted.uploadFile);
  app.get('/busted/:id/select-foreground', busted.selectForeground);
  app.post('/busted/:id/select-foreground', busted.invokeBusted);
  app.get('/busted/:bustedid', busted.getBusted);
  app.get('/busted/:bustedid/results', busted.getBustedResults);

  // RELAX ROUTES
  relax = require( ROOT_PATH + '/app/routes/relax');
  app.get('/relax', relax.createForm);
  app.post('/relax/uploadfile', relax.uploadFile);
  app.get('/relax/:id/select-foreground', relax.selectForeground);
  app.post('/relax/:id/select-foreground', relax.invokeRelax);
  app.get('/relax/:relaxid', relax.getRelax);
  app.get('/relax/:relaxid/restart', relax.restartRelax);
  app.get('/relax/:relaxid/results', relax.getRelaxResults);
  app.get('/relax/:relaxid/recheck', relax.getRelaxRecheck);

  // aBSREL ROUTES
  absrel = require( ROOT_PATH + '/app/routes/absrel');
  app.get('/absrel', absrel.form);
  app.post('/absrel', absrel.invoke);
  app.get('/absrel/:id', absrel.getPage);
  app.get('/absrel/:id/results', absrel.getResults);

  // Stats ROUTES
  stats = require( ROOT_PATH + '/app/routes/stats');
  app.get('/:type/usage', stats.usageStatistics);

  // HIV TRACE ROUTES
  hivtrace = require( ROOT_PATH + '/app/routes/hivtrace');
  app.get('/hivtrace', hivtrace.clusterForm);
  app.post('/hivtrace/uploadfile', hivtrace.uploadFile);
  app.get('/hivtrace/:id/map-attributes', hivtrace.mapAttributes);
  app.post('/hivtrace/:id/save-attributes', hivtrace.saveAttributes);
  app.post('/hivtrace/invoke/:id', hivtrace.invokeClusterAnalysis);
  app.get('/hivtrace/:id', hivtrace.jobPage);
  app.get('/hivtrace/:id/results', hivtrace.results);
  app.get('/hivtrace/:id/attributes', hivtrace.attributeMap);

  // FLEA ROUTES
  flea = require( ROOT_PATH + '/app/routes/flea');
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

  // STATS ROUTES
  stats = require( ROOT_PATH + '/app/routes/stats');
  app.get('/:type/usage', stats.usageStatistics);

}
