var error = require(__dirname + " /../../lib/error.js"),
  winston = require("winston"),
  logger = require("../../lib/logger");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  BGM = mongoose.model("BGM");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/bgm";
  res.render("bgm/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var fn = req.files.files.file,
    postdata = req.body;

  let options = {
    datatype: postdata.datatype,
    gencodeid: postdata.gencodeid,
    mail: postdata.mail,
    length_of_each_chain: postdata.length_of_each_chain,
    substitution_model: postdata.substitution_model,
    number_of_burn_in_samples: postdata.number_of_burn_in_samples,
    number_of_samples: postdata.number_of_samples,
    maximum_parents_per_node: postdata.maximum_parents_per_node,
    minimum_subs_per_site: postdata.minimum_subs_per_site,
  };

  BGM.spawn(fn, options, (err, result) => {
    if (err) {
      logger.error("bgm rename failed");
      res.json(500, { error: err });
    }
    res.json(200, {
      analysis: result,
      upload_redirect_path: result.upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var bgmid = req.params.id;

  //Return all results
  BGM.findOne({ _id: bgmid }, function (err, bgm) {
    if (err || !bgm) {
      res.json(500, error.errorResponse("Invalid ID : " + bgmid));
    } else {
      // Should return results page
      res.render("bgm/jobpage.ejs", { job: bgm });
    }
  });
};

exports.getResults = function (req, res) {
  var bgmid = req.params.id;
  BGM.findOne({ _id: bgmid }, function (err, bgm) {
    if (err || !bgm) {
      res.json(500, error.errorResponse("invalid id : " + bgmid));
    } else {
      // Should return results page
      // Append PMID to results
      var bgm_results = JSON.parse(bgm.results);
      bgm_results["PMID"] = bgm.pmid;
      res.json(200, bgm_results);
    }
  });
};

exports.getInfo = function (req, res) {
  var id = req.params.id;

  //Return all results
  BGM.findOne(
    { _id: id },
    { creation_time: 1, start_time: 1, status: 1 },
    function (err, bgm_info) {
      if (err || !bgm_info) {
        res.json(500, error.errorResponse("Invalid ID : " + id));
      } else {
        // Should return results page
        res.json(200, bgm_info);
      }
    }
  );
};

exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  BGM.findOne({ _id: id }, function (err, bgm) {
    if (err || !bgm) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(bgm.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', meme.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  BGM.findOne({ _id: id }, function (err, bgm) {
    if (err || !bgm) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      bgm.cancel(function (err, success) {
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
  BGM.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  BGM.findOne({ _id: id }, function (err, bgm) {
    res.sendFile(bgm.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  BGM.findOne({ _id: id }, function (err, bgm) {
    if (err || !bgm) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(bgm.filepath)
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
  client.get(BGM.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
