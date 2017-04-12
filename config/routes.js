
var path = require('path');

module.exports = function(app) {

  // HOME PAGE
  home = require(path.join(__dirname, '../app/routes/home'));
  app.get('/', home.homePage);
  app.get('/help', home.help);
  app.get('/jobqueue', home.jobQueuePage);
  app.get('/jobqueue/json', home.jobQueue);
  app.get('/stats', home.stats);
  app.get('/clusterhealth', home.clusterhealth);
  app.get('/stats_test', home.stats_test);
  app.get('/analyses', home.analyses);
  app.get('/development', home.development);
  app.get('/copyright_notice', home.copyright);
  app.get('/uploads', home.data_privacy);

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
  busted.resubscribePendingJobs();


  // FADE ROUTES
  fade = require(path.join(__dirname, '../app/routes/fade'));
  app.get('/fade', fade.createForm);
  app.post('/fade/uploadfile', fade.uploadFile);
  app.get('/fade/:id/select-foreground', fade.selectForeground);
  app.post('/fade/:id/select-foreground', fade.invokeFade);
  app.get('/fade/:fadeid', fade.getPage);
  app.get('/fade/:fadeid/info', fade.getInfo);
  app.get('/fade/:fadeid/cancel', fade.cancel);
  app.get('/fade/:fadeid/results', fade.getResults);
  app.get('/fade/:fadeid/log.txt', fade.getLog);
  //fade.resubscribePendingJobs();

  // FEL ROUTES
  fel = require(path.join(__dirname, '../app/routes/fel'));
  app.get('/fel', fel.form);
  app.post('/fel', fel.uploadFile);
  app.get('/fel/:id/select-foreground', fel.selectForeground);
  app.post('/fel/:id/select-foreground', fel.invoke);
  app.get('/fel/:id', fel.getPage);
  app.get('/fel/:id/info', fel.getInfo);
  app.get('/fel/:id/results', fel.getResults);
  app.get('/fel/:id/cancel', fel.cancel);
  app.get('/fel/:id/log.txt', fel.getLog);
  fel.resubscribePendingJobs();

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
  app.get('/flea/data/:id/divergence', flea.getDivergence);
  app.get('/flea/data/:id/copynumbers', flea.getCopyNumbers);
  app.get('/flea/data/:id/dates', flea.getDates);
  app.get('/flea/data/:id/runinfo', flea.getRunInfo);
  app.get('/flea/data/:id/genes', flea.getGenes);
  app.get('/flea/data/:id/coordinates', flea.getCoordinates);

  // HIV-TRACE ROUTES
  hivtrace = require(path.join(__dirname, '../app/routes/hivtrace'));
  app.get('/hivtrace', hivtrace.clusterForm);
  app.post('/hivtrace/:id/uploadfile', hivtrace.uploadFile);
  app.get ('/hivtrace/request-job-id', hivtrace.requestID); 
  app.get('/hivtrace/:id/map-attributes', hivtrace.mapAttributes);
  app.post('/hivtrace/:id/save-attributes', hivtrace.saveAttributes);
  app.post('/hivtrace/invoke/:id', hivtrace.invokeClusterAnalysis);
  app.get('/hivtrace/:id', hivtrace.jobPage);
  app.get('/hivtrace/:id/results', hivtrace.results);
  app.get('/hivtrace/:id/trace_results', hivtrace.trace_results);
  app.get('/hivtrace/:id/settings', hivtrace.settings);
  app.get('/hivtrace/:id/attributes', hivtrace.attributeMap);
  app.get('/hivtrace/:id/aligned.fasta', hivtrace.aligned_fasta);

  // MEME ROUTES
  meme = require(path.join(__dirname, '../app/routes/meme'));
  app.get('/meme', meme.form);
  app.post('/meme', meme.invoke);
  app.get('/meme/:id', meme.getPage);
  app.get('/meme/:id/info', meme.getInfo);
  app.get('/meme/:id/results', meme.getResults);
  app.get('/meme/:id/cancel', meme.cancel);
  app.get('/meme/:id/log.txt', meme.getLog);
  meme.resubscribePendingJobs();

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

}
