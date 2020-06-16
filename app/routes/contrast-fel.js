var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  path = require("path"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  ContrastFEL = mongoose.model("ContrastFEL");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/contrast_fel";
  res.render("contrast_fel/msa_form.ejs", { post_to: post_to });
};

exports.uploadFile = function (req, res) {
  var connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    contrast_fel = new ContrastFEL(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid,
    ds_variation = postdata.ds_variation;

  contrast_fel.original_extension = path.basename(fn).split(".")[1];
  contrast_fel.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > contrast_fel.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " +
        contrast_fel.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > contrast_fel.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        contrast_fel.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    contrast_fel.msa = msa;
    contrast_fel.status = contrast_fel.status_stack[0];
    contrast_fel.ds_variation = ds_variation;

    contrast_fel.save(function (err, contrast_fel_result) {
      if (err) {
        logger.error("contrast_fel save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("contrast_fel rename failed");
          res.json(500, { error: err });
        } else {
          var move = Msa.removeTreeFromFile(
            contrast_fel_result.filepath,
            contrast_fel_result.filepath
          );
          move.then(
            (val) => {
              res.json(200, {
                analysis: contrast_fel,
                upload_redirect_path: contrast_fel.upload_redirect_path,
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
        fs.writeFile(contrast_fel_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            res.json(500, { error: err });
          }
          helpers.moveSafely(
            req.files.files.file,
            contrast_fel_result.filepath,
            move_cb
          );
        });
      });
    });
  });
};

exports.selectForeground = function (req, res) {
  var id = req.params.id;

  ContrastFEL.findOne({ _id: id }, function (err, contrast_fel) {
    res.format({
      html: function () {
        res.render("contrast_fel/form.ejs", { contrast_fel: contrast_fel });
      },
      json: function () {
        res.json(200, contrast_fel);
      },
    });
  });
};

exports.invoke = function (req, res) {
  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  ContrastFEL.findOne({ _id: id }, function (err, contrast_fel) {
    // User Parameters
    contrast_fel.tagged_nwk_tree = postdata.nwk_tree;
    contrast_fel.analysis_type = postdata.analysis_type;
    contrast_fel.status = contrast_fel.status_stack[0];
    contrast_fel.branch_sets = postdata.branch_sets.split(",");

    contrast_fel.save(function (err, result) {
      if (err) {
        // Redisplay form with errors
        res.format({
          html: function () {
            res.render("contrast_fel/form.ejs", {
              errors: err.errors,
              contrast_fel: contrast_fel,
            });
          },
          json: function () {
            // Save contrast_fel analysis
            res.json(200, {
              msg: "Job with contrast_fel id " + id + " not found",
            });
          },
        });

        // Successful upload, spawn job
      } else {
        var connect_callback = function (data) {
          if (data == "connected") {
            logger.log("connected");
          }
        };

        res.json(200, { contrast_fel: result });
        ContrastFEL.submitJob(result, connect_callback);
      }
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var contrast_felid = req.params.id;

  //Return all results
  ContrastFEL.findOne({ _id: contrast_felid }, function (err, contrast_fel) {
    if (err || !contrast_fel) {
      res.json(500, error.errorResponse("invalid id : " + contrast_felid));
    } else {
      res.format({
        json: function () {
          res.json(contrast_fel);
        },

        html: function () {
          res.render("contrast_fel/jobpage.ejs", { job: contrast_fel });
        },
      });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/contrast_fel/:id/results', contrast_fel.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  ContrastFEL.findOne({ _id: id }, function (err, contrast_fel) {
    if (err || !contrast_fel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(contrast_fel.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/contrast_fel/:id/cancel', contrast_fel.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  ContrastFEL.findOne({ _id: id }, function (err, contrast_fel) {
    if (err || !contrast_fel) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      contrast_fel.cancel(function (err, success) {
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
  ContrastFEL.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  ContrastFEL.findOne({ _id: id }, function (err, contrast_fel) {
    res.sendFile(contrast_fel.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  ContrastFEL.findOne({ _id: id }, function (err, contrast_fel) {
    if (err || !contrast_fel) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(contrast_fel.filepath)
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
  client.get(ContrastFEL.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
