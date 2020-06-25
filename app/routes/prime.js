var error = require(__dirname + " /../../lib/error.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  logger = require("../../lib/logger");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  PRIME = mongoose.model("PRIME");

exports.form = function (req, res) {
  var post_to = "/prime";
  res.render("prime/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    prime = new PRIME(),
    postdata = req.body,
    datatype = postdata.datatype,
    gencodeid = postdata.gencodeid;

  prime.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    prime.msa = msa;
    prime.status = prime.status_stack[0];

    prime.save(function (err, prime_result) {
      if (err) {
        logger.error("prime save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("prime rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = prime;
          to_send.upload_redirect_path = prime.upload_redirect_path;
          res.json(200, {
            analysis: prime,
            upload_redirect_path: prime.upload_redirect_path,
          });

          // Send the MSA and analysis type
          PRIME.submitJob(prime_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, prime_result.filepath, move_cb);
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var primeid = req.params.id;

  //Return all results
  PRIME.findOne({ _id: primeid }, function (err, prime) {
    if (err || !prime) {
      res.json(500, error.errorResponse("Invalid ID : " + primeid));
    } else {
      // Should return results page
      res.render("prime/jobpage.ejs", { job: prime });
    }
  });
};

exports.getResults = function (req, res) {
  var primeid = req.params.id;
  PRIME.findOne({ _id: primeid }, function (err, prime) {
    if (err || !prime) {
      res.json(500, error.errorResponse("invalid id : " + primeid));
    } else {
      // Should return results page
      // Append PMID to results
      var prime_results = JSON.parse(prime.results);
      prime_results["PMID"] = prime.pmid;
      res.json(200, prime_results);
    }
  });
};

/**
 * Returns log txt file
 * app.get('/prime/:id/results', prime.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  PRIME.findOne({ _id: id }, function (err, prime) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(prime.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', prime.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  PRIME.findOne({ _id: id }, function (err, prime) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      prime.cancel(function (err, success) {
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
  PRIME.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  PRIME.findOne({ _id: id }, function (err, prime) {
    res.sendFile(prime.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};
