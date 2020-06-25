/*jslint node: true */

var error = require(__dirname + " /../../lib/error.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  fs = require("fs"),
  path = require("path"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Relax = mongoose.model("Relax");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.createForm = function (req, res) {
  res.render("relax/upload_msa.ejs");
};

exports.uploadFile = function (req, res) {
  var fn = req.files.files.file,
    relax = new Relax(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  relax.mail = postdata.mail;
  relax.analysis_type = postdata.analysis_type;
  relax.original_extension = path.basename(fn).split(".")[1];

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > relax.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + relax.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > relax.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        relax.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    relax.msa = msa;

    relax.save(function (err, relax_result) {
      if (err) {
        logger.error("relax save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("relax rename failed");
          res.json(500, { error: err });
        } else {
          var move = Msa.removeTreeFromFile(
            relax_result.filepath,
            relax_result.filepath
          );
          move.then(
            (val) => {
              res.json(200, relax);
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
        fs.writeFile(relax_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            res.json(500, { error: err });
          }
          helpers.moveSafely(
            req.files.files.file,
            relax_result.filepath,
            move_cb
          );
        });
      });
    });
  });
};

exports.selectForeground = function (req, res) {
  var id = req.params.id;

  Relax.findOne({ _id: id }, function (err, relax) {
    res.format({
      html: function () {
        res.render("relax/form.ejs", { relax: relax });
      },
      json: function () {
        res.json(200, relax);
      },
    });
  });
};

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/relax', Relax.invokeRelax);
 */
exports.invokeRelax = function (req, res) {
  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  Relax.findOne({ _id: id }, function (err, relax) {
    // User Parameters
    relax.tagged_nwk_tree = postdata.nwk_tree;
    relax.status = relax.status_stack[0];

    relax.save(function (err, result) {
      if (err) {
        // Redisplay form with errors
        res.format({
          html: function () {
            res.render("relax/form.ejs", {
              errors: err.errors,
              relax: relax,
            });
          },
          json: function () {
            // Save relax analysis
            res.json(200, { msg: "Job with relax id " + id + " not found" });
          },
        });

        // Successful upload, spawn job
      } else {
        var connect_callback = function (data) {
          if (data == "connected") {
            logger.log("connected");
          }
        };

        res.json(200, { relax: result });
        Relax.submitJob(result, connect_callback);
      }
    });
  });
};

/**
 * Displays id page for analysis
 * app.get('/relax/:relaxid', relax.getRelax);
 */
exports.getPage = function (req, res) {
  // Find the analysis
  // Return its results
  var relaxid = req.params.id;

  //Return all results
  Relax.findOne({ _id: relaxid }, function (err, relax) {
    if (err || !relax) {
      res.json(500, error.errorResponse("Invalid ID : " + relaxid));
    } else {
      if (!relax.torque_id) {
        relax.torque_id = "N/A";
      }
      // Should return results page
      res.render("relax/jobpage.ejs", { job: relax });
    }
  });
};

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/relax', Relax.invokeRelax);
 */
exports.restart = function (req, res) {
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  Relax.findOne({ _id: id }, function (err, result) {
    if (err) {
      // Redisplay form with errors
      res.format({
        html: function () {
          res.render("analysis/relax/form.ejs", {
            errors: err.errors,
            relax: relax,
          });
        },
        json: function () {
          // Save relax analysis
          res.json(200, { msg: "Job with relax id " + id + " not found" });
        },
      });

      // Successful upload, spawn job
    } else {
      var connect_callback = function (data) {
        if (data == "connected") {
          logger.log("connected");
        }
      };

      res.json(200, { relax: result });
      Relax.submitJob(result, connect_callback);
    }
  });
};

/*
 * Displays id page for analysis
 * app.get('/relax/:relaxid', relax.getRelax);
 */
exports.getRecheck = function (req, res) {
  var relaxid = req.params.id;

  Relax.findOne({ _id: relaxid }, function (err, relax) {
    if (err || !relax) {
      res.json(500, error.errorResponse("Invalid ID : " + relaxid));
    } else {
      var callback = function (data) {
        res.json(200, data);
      };

      Relax.submitJob(result, callback);
    }
  });
};

/**
 * Returns log txt file
 * app.get('/relax/:id/log.txt', relax.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  Relax.findOne({ _id: id }, function (err, relax) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(relax.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/relax/:id/cancel', relax.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  Relax.findOne({ _id: id }, function (err, relax) {
    if (err || !relax) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      relax.cancel(function (err, success) {
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
  Relax.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  Relax.findOne({ _id: id }, function (err, relax) {
    res.sendFile(relax.original_fn, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  Relax.findOne({ _id: id }, function (err, relax) {
    if (err || !relax) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(relax.filepath)
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
  client.get(Relax.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
