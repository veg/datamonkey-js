var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  logger = require("../../lib/logger");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  FUBAR = mongoose.model("FUBAR");

var redis = require("redis"),
  client = redis.createClient({ host: "localhost", port: 6379 });

exports.form = function(req, res) {
  var post_to = "/fubar";
  res.render("fubar/form.ejs", { post_to: post_to });
};

exports.invoke = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    fubar = new FUBAR(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  if (postdata.receive_mail == "true") {
    fubar.mail = postdata.mail;
  }

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > fubar.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + fubar.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > fubar.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        fubar.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    fubar.msa = msa;

    fubar.status = fubar.status_stack[0];
    fubar.number_of_grid_points = postdata.number_of_grid_points;
    fubar.number_of_mcmc_chains = postdata.number_of_mcmc_chains;
    fubar.length_of_each_chain = postdata.length_of_each_chain;
    fubar.number_of_burn_in_samples = postdata.number_of_burn_in_samples;
    fubar.number_of_samples = postdata.number_of_samples;
    fubar.concentration_of_dirichlet_prior =
      postdata.concentration_of_dirichlet_prior;

    fubar.save(function(err, fubar_result) {
      if (err) {
        logger.error("fubar save failed");
        logger.error(err);
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(err);
          logger.error("fubar rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = fubar;
          to_send.upload_redirect_path = fubar.upload_redirect_path;
          res.json(200, {
            analysis: fubar,
            upload_redirect_path: fubar.upload_redirect_path
          });

          // Send the MSA and analysis type
          FUBAR.submitJob(fubar_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, fubar_result.filepath, move_cb);
    });
  });
};

exports.getPage = function(req, res) {
  // Find the analysis
  var fubarid = req.params.id;

  //Return all results
  FUBAR.findOne({ _id: fubarid }, function(err, fubar) {
    if (err || !fubar) {
      res.json(500, error.errorResponse("Invalid ID : " + fubarid));
    } else {
      // Should return results page
      res.render("fubar/jobpage.ejs", { job: fubar });
    }
  });
};

exports.getResults = function(req, res) {
  var fubarid = req.params.id;
  FUBAR.findOne({ _id: fubarid }, function(err, fubar) {
    if (err || !fubar) {
      logger.error("invalid id : " + fubarid);
      res.json(500, error.errorResponse("invalid id : " + fubarid));
    } else {
      // Should return results page
      // Append PMID to results
      var fubar_results = JSON.parse(fubar.results);
      fubar_results["PMID"] = fubar.pmid;
      res.json(200, fubar_results);
    }
  });
};

// app.get('/fubar/:id/info', fubar.getInfo);
exports.getInfo = function(req, res) {
  var id = req.params.id;

  //Return all results
  FUBAR.findOne(
    { _id: id },
    { creation_time: 1, start_time: 1, status: 1 },
    function(err, fubar_info) {
      if (err || !fubar_info) {
        logger.error(err);
        res.json(500, error.errorResponse("Invalid ID : " + id));
      } else {
        // Should return results page
        res.json(200, fubar_info);
      }
    }
  );
};

/**
 * Returns log txt file
 * app.get('/fubar/:id/results', fubar.getLog);
 */
exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  FUBAR.findOne({ _id: id }, function(err, fubar) {
    if (err || !fubar) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(fubar.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/fubar/:id/cancel', fubar.cancel);
 */
exports.cancel = function(req, res) {
  var id = req.params.id;

  //Return all results
  FUBAR.findOne({ _id: id }, function(err, fubar) {
    if (err || !fubar) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      fubar.cancel(function(err, success) {
        if (success) {
          res.json(200, { success: "yes" });
        } else {
          res.json(500, { success: "no" });
        }
      });
    }
  });
};

exports.resubscribePendingJobs = function(req, res) {
  FUBAR.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  FUBAR.findOne({ _id: id }, function(err, fubar) {
    res.sendFile(fubar.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function(req, res) {
  var id = req.params.id;

  FUBAR.findOne({ _id: id }, function(err, fubar) {
    if (err || !fubar) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(fubar.filepath)
      .then(value => {
        res.json(200, { fasta: value });
      })
      .catch(err => {
        winston.info(err);
        res.json(500, { error: "Unable to deliver fasta." });
      });
  });
};

exports.getUsage = function(req, res) {
  client.get(FUBAR.cachePath(), function(err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
