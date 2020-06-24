var path = require("path");
var _ = require("underscore");

//import {apiSubmit} from '../app/routes/api.js';
const api = require("../app/routes/api.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  FEL = mongoose.model("FEL"),
  ContrastFEL = mongoose.model("ContrastFEL"),
  aBSREL = mongoose.model("aBSREL"),
  Busted = mongoose.model("Busted"),
  BGM = mongoose.model("BGM"),
  FUBAR = mongoose.model("FUBAR"),
  GARD = mongoose.model("GARD"),
  MEME = mongoose.model("MEME"),
  MULTIHIT = mongoose.model("MULTIHIT"),
  Relax = mongoose.model("Relax"),
  HivTrace = mongoose.model("HivTrace"),
  FADE = mongoose.model("Fade"),
  SLAC = mongoose.model("SLAC");

module.exports = function (app) {
  var analysis = require("../app/routes/analysis.js");
  // HOME PAGE
  home = require(path.join(__dirname, "../app/routes/home"));
  app.get("/", home.homePage);
  app.get("/help", home.help);
  app.get("/jobqueue", home.jobQueuePage);
  app.get("/jobqueue/json", home.jobQueue);
  app.get("/stats", home.stats);
  app.get("/clusterhealth", home.clusterhealth);
  app.get("/clusterhealth/:id", home.clusterhealth);
  app.get("/stats_test", home.stats_test);
  app.get("/analyses", home.analyses);
  app.get("/citations", home.citations);
  app.get("/development", home.development);
  app.get("/copyright_notice", home.copyright);
  app.get("/uploads", home.data_privacy);
  app.get("/analysistree", home.analysis_tree);

  // aBSREL ROUTES
  absrel = require(path.join(__dirname, "../app/routes/absrel"));
  app.get("/absrel", absrel.form);
  app.post("/absrel", absrel.uploadFile);
  app.get("/absrel/:id/original_file/:name", absrel.getMSAFile);
  app.get("/absrel/:id/fasta", absrel.fasta);
  app.get("/absrel/usage", absrel.getUsage);
  app.get("/absrel/:id/select-foreground", absrel.selectForeground);
  app.post("/absrel/:id/select-foreground", absrel.invoke);
  app.get("/absrel/:id", absrel.getPage);
  app.get("/absrel/:id/info", _.partial(analysis.getInfo, aBSREL));
  app.get("/absrel/:id/results", _.partial(analysis.getResults, aBSREL));
  app.get("/absrel/:id/cancel", absrel.cancel);
  app.get("/absrel/:id/log.txt", absrel.getLog);
  absrel.resubscribePendingJobs();

  // BUSTED ROUTES
  busted = require(path.join(__dirname, "../app/routes/busted"));
  app.get("/busted", busted.createForm);
  app.post("/busted", busted.uploadFile);
  app.get("/busted/:id/original_file/:name", busted.getMSAFile);
  app.get("/busted/:id/fasta", busted.fasta);
  app.get("/busted/usage", busted.getUsage);
  app.get("/busted/:id/select-foreground", busted.selectForeground);
  app.post("/busted/:id/select-foreground", busted.invokeBusted);
  app.get("/busted/:bustedid", busted.getPage);
  app.get("/busted/:id/info", _.partial(analysis.getInfo, Busted));
  app.get("/busted/:bustedid/cancel", busted.cancel);
  app.get("/busted/:id/results", _.partial(analysis.getResults, Busted));
  app.get("/busted/:bustedid/log.txt", busted.getLog);
  busted.resubscribePendingJobs();

  // Contrast-FEL ROUTES
  contrast_fel = require(path.join(__dirname, "../app/routes/contrast-fel"));
  app.get("/contrast_fel", contrast_fel.form);
  app.post("/contrast_fel", contrast_fel.uploadFile);
  app.get("/contrast_fel/usage", contrast_fel.getUsage);
  app.get("/contrast_fel/:id/select-foreground", contrast_fel.selectForeground);
  app.post("/contrast_fel/:id/select-foreground", contrast_fel.invoke);
  app.get("/contrast_fel/:id/original_file/:name", contrast_fel.getMSAFile);
  app.get("/contrast_fel/:id/fasta", contrast_fel.fasta);
  app.get("/contrast_fel/:id", contrast_fel.getPage);
  app.get("/contrast_fel/:id/info", _.partial(analysis.getInfo, ContrastFEL));
  app.get(
    "/contrast_fel/:id/results",
    _.partial(analysis.getResults, ContrastFEL)
  );
  app.get("/contrast_fel/:id/cancel", contrast_fel.cancel);
  app.get("/contrast_fel/:id/log.txt", contrast_fel.getLog);
  contrast_fel.resubscribePendingJobs();

  // FADE ROUTES
  fade = require(path.join(__dirname, "../app/routes/fade"));
  app.get("/fade", fade.form);
  app.post("/fade", fade.invoke);
  app.get("/fade/usage", fade.getUsage);
  app.get("/fade/:id", fade.getPage);
  app.get("/fade/:id/original_file/:name", fade.getMSAFile);
  app.get("/fade/:id/fasta", fade.fasta);
  app.get("/fade/:id/info", _.partial(analysis.getInfo, FADE));
  app.get("/fade/:id/results", _.partial(analysis.getResults, FADE));
  app.get("/fade/:id/cancel", fade.cancel);
  app.get("/fade/:id/log.txt", fade.getLog);
  fade.resubscribePendingJobs();

  // FEL ROUTES
  fel = require(path.join(__dirname, "../app/routes/fel"));
  app.get("/fel", fel.form);
  app.post("/fel", fel.uploadFile);
  app.get("/fel/usage", fel.getUsage);
  app.get("/fel/:id/select-foreground", fel.selectForeground);
  app.post("/fel/:id/select-foreground", fel.invoke);
  app.get("/fel/:id/original_file/:name", fel.getMSAFile);
  app.get("/fel/:id/fasta", fel.fasta);
  app.get("/fel/:id", fel.getPage);
  app.get("/fel/:id/info", _.partial(analysis.getInfo, FEL));
  app.get("/fel/:id/results", _.partial(analysis.getResults, FEL));
  app.get("/fel/:id/cancel", fel.cancel);
  app.get("/fel/:id/log.txt", fel.getLog);
  fel.resubscribePendingJobs();

  // FLEA ROUTES
  flea = require(path.join(__dirname, "../app/routes/flea"));
  app.get("/flea", flea.form);
  app.post("/flea", flea.invoke);
  app.get("/flea/:id", flea.getPage);
  app.get("/flea/:id/restart", flea.restart);
  app.get("/flea/view/:id*", flea.getPage);
  app.get("/flea/view/:id", flea.getPage);
  app.get("/flea/api/sessions/:id", flea.getSessionJSON);
  app.get("/flea/api/zips/:id.zip", flea.getSessionZip);

  // FUBAR ROUTES
  fubar = require(path.join(__dirname, "../app/routes/fubar"));
  app.get("/fubar", fubar.form);
  app.post("/fubar", fubar.invoke);
  app.get("/fubar/usage", fubar.getUsage);
  app.get("/fubar/:id", fubar.getPage);
  app.get("/fubar/:id/original_file/:name", fubar.getMSAFile);
  app.get("/fubar/:id/fasta", fubar.fasta);
  app.get("/fubar/:id/info", _.partial(analysis.getInfo, FUBAR));
  app.get("/fubar/:id/results", _.partial(analysis.getResults, FUBAR));
  app.get("/fubar/:id/cancel", fubar.cancel);
  app.get("/fubar/:id/log.txt", fubar.getLog);
  fubar.resubscribePendingJobs();

  // GARD ROUTES
  gard = require(path.join(__dirname, "../app/routes/gard"));
  app.get("/gard", gard.form);
  app.post("/gard", gard.invoke);
  app.get("/gard/usage", gard.getUsage);
  app.get("/gard/:id/screened_data", gard.getScreenedData);
  app.get("/gard/:id", gard.getPage);
  app.get("/gard/:id/original_file/:name", gard.getMSAFile);
  app.get("/gard/:id/fasta", gard.fasta);
  app.get("/gard/:id/info", _.partial(analysis.getInfo, GARD));
  app.get("/gard/:id/results", _.partial(analysis.getResults, GARD));
  app.get("/gard/:id/cancel", gard.cancel);
  app.get("/gard/:id/log.txt", gard.getLog);
  gard.resubscribePendingJobs();

  // HIV-TRACE ROUTES
  hivtrace = require(path.join(__dirname, "../app/routes/hivtrace"));
  app.get("/hivtrace", hivtrace.clusterForm);
  app.get("/hivtrace/usage", hivtrace.getUsage);
  app.post("/hivtrace/:id/uploadfile", hivtrace.uploadFile);
  app.get("/hivtrace/request-job-id", hivtrace.requestID);
  app.get("/hivtrace/:id/map-attributes", hivtrace.mapAttributes);
  app.post("/hivtrace/:id/save-attributes", hivtrace.saveAttributes);
  app.post("/hivtrace/invoke/:id", hivtrace.invokeClusterAnalysis);
  app.get("/hivtrace/:id", hivtrace.jobPage);
  app.get("/hivtrace/:id/results", hivtrace.results);
  app.get("/hivtrace/:id/trace_results", hivtrace.trace_results);
  app.get("/hivtrace/:id/settings", hivtrace.settings);
  app.get("/hivtrace/:id/attributes", hivtrace.attributeMap);
  app.get("/hivtrace/:id/aligned.fasta", hivtrace.aligned_fasta);

  // MULTIHIT ROUTES
  multihit = require(path.join(__dirname, "../app/routes/multihit"));
  app.get("/multihit", multihit.form);
  app.post("/multihit", multihit.invoke);
  app.get("/multihit/usage", multihit.getUsage);
  app.get("/multihit/:id", multihit.getPage);
  app.get("/multihit/:id/original_file/:name", multihit.getMSAFile);
  app.get("/multihit/:id/fasta", multihit.fasta);
  app.get("/multihit/:id/info", _.partial(analysis.getInfo, MULTIHIT));
  app.get("/multihit/:id/results", _.partial(analysis.getResults, MULTIHIT));
  app.get("/multihit/:id/cancel", multihit.cancel);
  app.get("/multihit/:id/log.txt", multihit.getLog);
  multihit.resubscribePendingJobs();

  // MEME ROUTES
  meme = require(path.join(__dirname, "../app/routes/meme"));
  app.get("/meme", meme.form);
  app.post("/meme", meme.invoke);
  app.get("/meme/usage", meme.getUsage);
  app.get("/meme/:id", meme.getPage);
  app.get("/meme/:id/original_file/:name", meme.getMSAFile);
  app.get("/meme/:id/fasta", meme.fasta);
  app.get("/meme/:id/info", _.partial(analysis.getInfo, MEME));
  app.get("/meme/:id/results", _.partial(analysis.getResults, MEME));
  app.get("/meme/:id/cancel", meme.cancel);
  app.get("/meme/:id/log.txt", meme.getLog);
  meme.resubscribePendingJobs();

  // PRIME ROUTES
  //prime = require(path.join(__dirname, '../app/routes/prime'));
  //app.get('/prime', prime.form);
  //app.post('/prime', prime.invoke);
  //app.get('/prime/:id', prime.getPage);
  //app.get('/prime/:id/info', prime.getInfo);
  //app.get('/prime/:id/results', prime.getResults);
  //app.get('/prime/:id/cancel', prime.cancel);
  //app.get('/prime/:id/log.txt', prime.getLog);
  //prime.resubscribePendingJobs();

  // RELAX ROUTES
  relax = require(path.join(__dirname, "../app/routes/relax"));
  app.get("/relax", relax.createForm);
  app.get("/relax/usage", relax.getUsage);
  app.post("/relax/uploadfile", relax.uploadFile);
  app.get("/relax/:id/select-foreground", relax.selectForeground);
  app.post("/relax/:id/select-foreground", relax.invokeRelax);
  app.get("/relax/:id", relax.getPage);
  app.get("/relax/:id/original_file/:name", relax.getMSAFile);
  app.get("/relax/:id/fasta", relax.fasta);
  app.get("/relax/:id/info", _.partial(analysis.getInfo, Relax));
  app.get("/relax/:id/cancel", relax.cancel);
  app.get("/relax/:id/restart", relax.restart);
  app.get("/relax/:id/results", _.partial(analysis.getResults, Relax));
  app.get("/relax/:id/recheck", relax.getRecheck);
  app.get("/relax/:id/log.txt", relax.getLog);
  relax.resubscribePendingJobs();

  // SLAC ROUTES
  slac = require(path.join(__dirname, "../app/routes/slac"));
  app.get("/slac", slac.form);
  app.post("/slac", slac.invoke);
  app.get("/slac/usage", slac.getUsage);
  app.get("/slac/:id", slac.getPage);
  app.get("/slac/:id/original_file/:name", slac.getMSAFile);
  app.get("/slac/:id/fasta", slac.fasta);
  app.get("/slac/:id/info", _.partial(analysis.getInfo, SLAC));
  app.get("/slac/:id/results", _.partial(analysis.getResults, SLAC));
  app.get("/slac/:id/cancel", slac.cancel);
  app.get("/slac/:id/log.txt", slac.getLog);
  slac.resubscribePendingJobs();

  // BGM ROUTES
  bgm = require(path.join(__dirname, "../app/routes/bgm"));
  app.get("/bgm", bgm.form);
  app.post("/bgm", bgm.invoke);
  app.get("/bgm/usage", bgm.getUsage);
  app.get("/bgm/:id", bgm.getPage);
  app.get("/bgm/:id/original_file/:name", bgm.getMSAFile);
  app.get("/bgm/:id/info", _.partial(analysis.getInfo, BGM));
  app.get("/bgm/:id/results", _.partial(analysis.getResults, BGM));
  app.get("/bgm/:id/cancel", bgm.cancel);
  app.get("/bgm/:id/log.txt", bgm.getLog);
  bgm.resubscribePendingJobs();

  // API ROUTES
  //app.post("/api/v1/submit", api.apiSubmit);
  app.post("/api/v1/submit", api.apiSubmit);
  app.get("/api/v1/status", api.apiStatus);
  //app.post("/api/v1/debug", slac.invokeDEBUG);
};
