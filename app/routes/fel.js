var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  path = require("path"),
  logger = require("../../lib/logger");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  FEL = mongoose.model("FEL");

exports.form = function(req, res) {
  var post_to = "/fel";
  res.render("fel/msa_form.ejs", { post_to: post_to });
};

exports.uploadFile = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    fel = new FEL(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid,
    ds_variation = postdata.ds_variation;

  fel.original_extension = path.basename(fn).split('.')[1];
  if (postdata.receive_mail == "true") {
    fel.mail = postdata.mail;
  }

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > fel.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + fel.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > fel.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        fel.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    fel.msa = msa;
    fel.status = fel.status_stack[0];
    fel.ds_variation = ds_variation;

    fel.save(function(err, fel_result) {
      if (err) {
        logger.error("fel save failed");
        logger.error(err);
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(err);
          logger.error("fel rename failed");
          res.json(500, { error: err });
        } else {

          var move = Msa.removeTreeFromNexus(fel_result.filepath, fel_result.filepath);
          move.then(val=>{
            res.json(200, {
              analysis: fel,
              upload_redirect_path: fel.upload_redirect_path
            });
          }, reason => {
            res.json(500, {error: "issue removing tree from file"});
          });

        }
      }

      fs.readFile(fn, (err, data) => {
        if (err) {
          logger.error(err);
          logger.error("read file failed");
          res.json(500, { error: err });
        }
        fs.writeFile(fel_result.original_fn,  data, err => {
          if (err) {
            logger.error(err);
            logger.error("write file failed");
            res.json(500, { error: err });
          }
        helpers.moveSafely(req.files.files.file, fel_result.filepath, move_cb);
        });
      });
    });
  });
};

exports.selectForeground = function(req, res) {
  var id = req.params.id;

  FEL.findOne({ _id: id }, function(err, fel) {
    res.format({
      html: function() {
        res.render("fel/form.ejs", { fel: fel });
      },
      json: function() {
        res.json(200, fel);
      }
    });
  });
};

exports.invoke = function(req, res) {
  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  FEL.findOne({ _id: id }, function(err, fel) {
    // User Parameters
    fel.tagged_nwk_tree = postdata.nwk_tree;
    fel.analysis_type = postdata.analysis_type;
    fel.status = fel.status_stack[0];

    fel.save(function(err, result) {
      if (err) {
        // Redisplay form with errors
        res.format({
          html: function() {
            res.render("fel/form.ejs", {
              errors: err.errors,
              fel: fel
            });
          },
          json: function() {
            // Save fel analysis
            res.json(200, { msg: "Job with fel id " + id + " not found" });
          }
        });

        // Successful upload, spawn job
      } else {
        var connect_callback = function(data) {
          if (data == "connected") {
            logger.log("connected");
          }
        };

        res.json(200, { fel: result });
        FEL.submitJob(result, connect_callback);
      }
    });
  });
};

exports.getPage = function(req, res) {

  // Find the analysis
  var felid = req.params.id;

  //Return all results
  FEL.findOne({ _id: felid }, function(err, fel) {

    if (err || !fel) {
      logger.error(err);
      res.json(500, error.errorResponse("invalid id : " + felid));
    } else {
      res.format({

        json: function() {
          res.json(fel);
        },

        html : function() { 
          res.render("fel/jobpage.ejs", { job: fel });
        }

      });

    }

  });

};

exports.getResults = function(req, res) {
  var felid = req.params.id;

  FEL.findOne({ _id: felid }, function(err, fel) {
    if (err || !fel) {
      logger.error(err);
      res.json(500, error.errorResponse("invalid id : " + felid));
    } else {
      // Should return results page
      // Append PMID to results
      var fel_results = JSON.parse(fel.results);
      fel_results["PMID"] = fel.pmid;
      res.json(200, fel_results);
    }
  });
};

// app.get('/fel/:id/info', fel.getInfo);
exports.getInfo = function(req, res) {
  var id = req.params.id;

  //Return all results
  FEL.findOne(
    { _id: id },
    { creation_time: 1, start_time: 1, status: 1 },
    function(err, fel_info) {
      if (err || !fel_info) {
        logger.error(err);
        res.json(500, error.errorResponse("Invalid ID : " + id));
      } else {
        // Should return results page
        res.json(200, fel_info);
      }
    }
  );
};

/**
 * Returns log txt file 
 * app.get('/fel/:id/results', fel.getLog);
 */
exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  FEL.findOne({ _id: id }, function(err, fel) {
    if (err || !fel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(fel.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/fel/:id/cancel', fel.cancel);
 */
exports.cancel = function(req, res) {
  var id = req.params.id;

  //Return all results
  FEL.findOne({ _id: id }, function(err, fel) {
    if (err || !fel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      fel.cancel(function(err, success) {
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
  FEL.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id, name = req.params.name;

  var options = {};

  FEL.findOne({ _id: id }, function(err, fel) {
    res.sendFile(fel.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.getUsage = function(req, res) {
  FEL.usageStatistics(function(err, fel) {
    res.json(200, fel);
  });
};
