var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  aBSREL = mongoose.model("aBSREL");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/absrel";
  res.render("absrel/msa_form.ejs", { post_to: post_to });
};

exports.uploadFile = function (req, res) {
  var connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    absrel = new aBSREL(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  absrel.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > absrel.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + absrel.max_sites;
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > absrel.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        absrel.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    absrel.msa = msa;
    absrel.status = absrel.status_stack[0];

    absrel.save(function (err, absrel_result) {
      if (err) {
        logger.error("absrel save failed");
        console.log(err);
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("absrel rename failed");
          res.json(500, { error: err });
        } else {
          var move = Msa.removeTreeFromFile(
            absrel_result.filepath,
            absrel_result.filepath
          );
          move.then(
            (val) => {
              res.json(200, {
                analysis: absrel,
                upload_redirect_path: absrel.upload_redirect_path,
              });
            },
            (reason) => {
              res.json(500, { error: "issue removing tree from file" });
            }
          );
        }
      }

      fs.readFile(fn, (err, data) => {
        if (err) {
          logger.error("read file failed");
          res.json(500, { error: err });
        }
        fs.writeFile(absrel_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            res.json(500, { error: err });
          }
          helpers.moveSafely(
            req.files.files.file,
            absrel_result.filepath,
            move_cb
          );
        });
      });
    });
  });
};

exports.selectForeground = function (req, res) {
  var id = req.params.id;

  aBSREL.findOne({ _id: id }, function (err, absrel) {
    res.format({
      html: function () {
        res.render("absrel/form.ejs", { absrel: absrel });
      },
      json: function () {
        res.json(200, absrel);
      },
    });
  });
};

exports.invoke = function (req, res) {
  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  aBSREL.findOne({ _id: id }, function (err, absrel) {
    // User Parameters
    absrel.tagged_nwk_tree = postdata.nwk_tree;
    absrel.analysis_type = postdata.analysis_type;
    absrel.status = absrel.status_stack[0];

    absrel.save(function (err, result) {
      if (err) {
        // Redisplay form with errors
        res.format({
          html: function () {
            res.render("absrel/form.ejs", {
              errors: err.errors,
              absrel: absrel,
            });
          },
          json: function () {
            // Save absrel analysis
            res.json(200, { msg: "Job with absrel id " + id + " not found" });
          },
        });

        // Successful upload, spawn job
      } else {
        var connect_callback = function (data) {
          if (data == "connected") {
            logger.log("connected");
          }
        };

        res.json(200, { absrel: result });
        aBSREL.submitJob(result, connect_callback);
      }
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var absrelid = req.params.id;

  //Return all results
  aBSREL.findOne({ _id: absrelid }, function (err, absrel) {
    if (err || !absrel) {
      res.json(500, error.errorResponse("Invalid ID : " + absrelid));
    } else {
      // Should return results page
      res.render("absrel/jobpage.ejs", { job: absrel });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/absrel/:id/results', absrel.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  aBSREL.findOne({ _id: id }, function (err, absrel) {
    if (err || !absrel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(absrel.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/absrel/:id/cancel', absrel.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  aBSREL.findOne({ _id: id }, function (err, absrel) {
    if (err || !absrel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      absrel.cancel(function (err, success) {
        if (success) {
          res.json(200, { success: "yes" });
        } else {
          res.json(500, { success: "no" });
        }
      });
    }
  });
};

exports.resubscribePendingJobs = function (req, res) {
  aBSREL.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  aBSREL.findOne({ _id: id }, function (err, absrel) {
    res.sendFile(absrel.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  aBSREL.findOne({ _id: id }, function (err, absrel) {
    if (err || !absrel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    }
    Msa.deliverFasta(absrel.filepath)
      .then((value) => {
        res.json(200, { fasta: value });
      })
      .catch((err) => {
        winston.info(err);
        res.json(500, { error: "Unable to deliver fasta." });
      });
  });
};

exports.getUsage = function (req, res) {
  client.get(aBSREL.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
