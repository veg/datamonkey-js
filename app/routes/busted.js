var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  winston = require("winston"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  Busted = mongoose.model("Busted");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.createForm = function(req, res) {
  var post_to = "/busted";
  res.render("busted/upload_msa.ejs", { post_to: post_to });
};

exports.uploadFile = function(req, res) {
  var data = req.body;
  var fn = req.files.files.file;

  var busted = new Busted();
  var postdata = req.body;

  var datatype = 0,
    gencodeid = data.gencodeid,
    ds_variation = postdata.ds_variation;

  busted.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    if (msa.sites > busted.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + busted.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > busted.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        busted.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    busted.msa = msa;
    busted.ds_variation = ds_variation;

    busted.save(function(err, busted_result) {
      if (err) {
        logger.error("busted save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("busted rename failed");
          res.json(500, { error: err });
        } else {
          var move = Msa.removeTreeFromFile(
            busted_result.filepath,
            busted_result.filepath
          );
          move.then(
            val => {
              res.json(200, {
                analysis: busted_result,
                upload_redirect_path: busted.upload_redirect_path
              });
            },
            reason => {
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

        fs.writeFile(busted_result.original_fn, data, err => {
          if (err) {
            logger.error("write file failed");
            res.json(500, { error: err });
          }
          helpers.moveSafely(
            req.files.files.file,
            busted_result.filepath,
            move_cb
          );
        });
      });
    });
  });
};

exports.selectForeground = function(req, res) {
  var id = req.params.id;

  Busted.findOne({ _id: id }, function(err, busted) {
    res.format({
      html: function() {
        res.render("busted/form.ejs", { busted: busted });
      },
      json: function() {
        res.json(200, busted);
      }
    });
  });
};

/**
 * Handles a job request by the user
 * app.post('/busted', Busted.invokeBusted);
 */
exports.invokeBusted = function(req, res) {
  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  Busted.findOne({ _id: id }, function(err, busted) {
    busted.tagged_nwk_tree = postdata.nwk_tree;
    busted.status = busted.status_stack[0];

    busted.save(function(err, result) {
      if (err) {
        // Redisplay form with errors
        res.format({
          html: function() {
            res.render("busted/form.ejs", {
              errors: err.errors,
              busted: busted
            });
          },
          json: function() {
            // Save BUSTED analysis
            res.json(200, { msg: "Job with busted id " + id + " not found" });
          }
        });

        // Successful upload, spawn job
      } else {
        var connect_callback = function(data) {
          if (data == "connected") {
            logger.log("connected");
          }
        };

        res.json(200, { busted: result });

        Busted.submitJob(result, connect_callback);
      }
    });
  });
};

/**
 * Displays id page for analysis
 * app.get('/busted/:bustedid', busted.getBusted);
 */
exports.getPage = function(req, res) {
  // Find the analysis
  // Return its results
  var bustedid = req.params.bustedid;

  //Return all results
  Busted.findOne({ _id: bustedid }, function(err, busted) {
    if (err || !busted) {
      res.json(500, error.errorResponse("Invalid ID : " + bustedid));
    } else {
      if (!busted.last_status_msg) {
        busted.last_status_msg = "";
      }

      if (!busted.torque_id) {
        busted.torque_id = "";
      }

      // Should return results page
      //res.json(200, busted);
      res.render("busted/jobpage.ejs", { job: busted });
    }
  });
};

exports.resubscribePendingJobs = function(req, res) {
  Busted.subscribePendingJobs();
};

/**
 * Returns log txt file
 * app.get('/busted/:bustedid/results', busted.getBustedResults);
 */
exports.getLog = function(req, res) {
  var bustedid = req.params.bustedid;

  //Return all results
  Busted.findOne({ _id: bustedid }, function(err, busted) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + bustedid));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(busted.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:bustedid/cancel', busted.cancel);
 */
exports.cancel = function(req, res) {
  var bustedid = req.params.bustedid;

  //Return all results
  Busted.findOne({ _id: bustedid }, function(err, busted) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + bustedid));
    } else {
      busted.cancel(function(err, success) {
        if (success) {
          res.json(200, { success: "yes" });
        } else {
          res.json(500, { success: "no" });
        }
      });
    }
  });
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  Busted.findOne({ _id: id }, function(err, busted) {
    res.sendFile(busted.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function(req, res) {
  var id = req.params.id;

  Busted.findOne({ _id: id }, function(err, busted) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(busted.filepath)
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
  client.get(Busted.cachePath(), function(err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
