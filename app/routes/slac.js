var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js"),
  request = require("request");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  SLAC = mongoose.model("SLAC");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

const shortid = require("shortid"),
  os = require("os");

exports.form = function (req, res) {
  var post_to = "/slac";
  res.render("slac/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    slac = new SLAC(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  slac.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
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

    slac.save(function (err, slac_result) {
      if (err) {
        logger.error("slac save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("slac rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = slac;
          to_send.upload_redirect_path = slac.upload_redirect_path;
          res.json(200, {
            analysis: slac,
            upload_redirect_path: slac.upload_redirect_path,
          });

          // Send the MSA and analysis type
          SLAC.submitJob(slac_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, slac_result.filepath, move_cb);
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var slacid = req.params.id;

  //Return all results
  SLAC.findOne({ _id: slacid }, function (err, slac) {
    if (err || !slac) {
      res.json(500, error.errorResponse("Invalid ID : " + slacid));
    } else {
      // Should return results page
      res.render("slac/jobpage.ejs", { job: slac });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/slac/:id/results', slac.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne({ _id: id }, function (err, slac) {
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
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne({ _id: id }, function (err, slac) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      slac.cancel(function (err, success) {
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
  SLAC.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  SLAC.findOne({ _id: id }, function (err, slac) {
    res.sendFile(slac.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  SLAC.findOne({ _id: id }, function (err, slac) {
    if (err || !slac) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(slac.filepath)
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
  client.get(SLAC.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};

exports.invokeDEBUG = function (req, res, callback) {
  // console.log("SLAC DEBUG EVENT TRIGGERED REQ = " + JSON.stringify(req));
  // console.log("SLAC DEBUG EVENT TRIGGERED RES = " + JSON.stringify(res));

  shortid.characters(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
  );
  var url_fasta = req.body.fastaLoc,
    fileName = "api_" + shortid.generate() + "z.nex",
    dest = os.tmpdir() + "/",
    fullFileName = dest + fileName;

  function getRequest(url, dest, callback) {
    request(url, function (err) {
      if (err) {
        console.log("error :: Request failed due to URL");
        return err;
      }
    }).pipe(fs.createWriteStream(dest).on("finish", callback));
  }

  getRequest(url_fasta, fullFileName, function (err) {
    if (err) {
      console.log("There was an error saving this file to " + fullFileName);
      return;
    }
    console.log("File Saved to " + fullFileName);

    var connect_callback = function (data) {
      if (data == "connected") {
        logger.log("connected");
      }
    };

    var fn = fullFileName,
      slac = new SLAC(),
      postdata = req.body,
      datatype = 0,
      gencodeid = postdata.gencodeid;
    slac.mail = postdata.mail;

    Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
      if (err) {
        res.json(500, { error: err + today2.getMilliseconds() });
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

      slac.save(function (err, slac_result) {
        if (err) {
          logger.error("slac save failed");
          res.json(500, { error: err });
          return;
        }
        function move_cb(err, result) {
          if (err) {
            logger.error(
              "slac rename failed" +
                " Errored within routes/slac.js :: move_cb " +
                err
            );
            res.json(500, { error: err });
          } else {
            var to_send = slac;
            to_send.upload_redirect_path = slac.upload_redirect_path;
            //callback remove below for api
            res.json(200, {
              analysis: slac,
              upload_redirect_path: slac.upload_redirect_path,
            });

            // Send the MSA and analysis type
            SLAC.submitJob(slac_result, connect_callback);
          }
        }
        helpers.moveSafely(fn, slac_result.filepath, move_cb);
      });
    });
  });
};
