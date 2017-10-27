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
  SLAC = mongoose.model("SLAC");

exports.form = function(req, res) {
  var post_to = "/slac";
  res.render("slac/form.ejs", { post_to: post_to });
};

exports.invoke = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    slac = new SLAC(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  if (postdata.receive_mail == "true") {
    slac.mail = postdata.mail;
  }

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > slac.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + slac.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > slac.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        slac.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    slac.msa = msa;

    slac.status = slac.status_stack[0];

    slac.save(function(err, slac_result) {
      if (err) {
        logger.error("slac save failed");
        logger.error(err);
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(err);
          logger.error("slac rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = slac;
          to_send.upload_redirect_path = slac.upload_redirect_path;
          res.json(200, {
            analysis: slac,
            upload_redirect_path: slac.upload_redirect_path
          });

          // Send the MSA and analysis type
          SLAC.submitJob(slac_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, slac_result.filepath, move_cb);
    });
  });
};

exports.getPage = function(req, res) {
  // Find the analysis
  var slacid = req.params.id;

  //Return all results
  SLAC.findOne({ _id: slacid }, function(err, slac) {
    if (err || !slac) {
      logger.error(err);
      res.json(500, error.errorResponse("Invalid ID : " + slacid));
    } else {
      // Should return results page
      res.render("slac/jobpage.ejs", { job: slac });
    }
  });
};

exports.getResults = function(req, res) {
  var slacid = req.params.id;
  SLAC.findOne({ _id: slacid }, function(err, slac) {
    if (err || !slac) {
      logger.error(err);
      res.json(500, error.errorResponse("invalid id : " + slacid));
    } else {
      // Should return results page
      // Append PMID to results
      var slac_results = JSON.parse(slac.results);
      slac_results["PMID"] = slac.pmid;
      res.json(200, slac_results);
    }
  });
};

// app.get('/slac/:id/info', slac.getInfo);
exports.getInfo = function(req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne(
    { _id: id },
    { creation_time: 1, start_time: 1, status: 1 },
    function(err, slac_info) {
      if (err || !slac_info) {
        logger.error(err);
        res.json(500, error.errorResponse("Invalid ID : " + id));
      } else {
        // Should return results page
        res.json(200, slac_info);
      }
    }
  );
};

/**
 * Returns log txt file 
 * app.get('/slac/:id/results', slac.getLog);
 */
exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne({ _id: id }, function(err, slac) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(slac.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', slac.cancel);
 */
exports.cancel = function(req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne({ _id: id }, function(err, slac) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      slac.cancel(function(err, success) {
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
  SLAC.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id, name = req.params.name;

  var options = {};

  SLAC.findOne({ _id: id }, function(err, slac) {
    res.sendFile(slac.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.getUsage = function(req, res) {
  SLAC.usageStatistics(function(err, fel) {
    res.json(200, fel);
  });
};
