var logger = require(ROOT_PATH + "/lib/logger");

var error = require(ROOT_PATH + "/lib/error.js"),
  helpers = require(ROOT_PATH + "/lib/helpers.js"),
  globals = require(ROOT_PATH + "/config/globals.js"),
  mailer = require(ROOT_PATH + "/lib/mailer.js"),
  fs = require("fs"),
  redis = require("redis"),
  hpcsocket = require(ROOT_PATH + "/lib/hpcsocket.js"),
  setup = require(ROOT_PATH + "/config/setup"),
  _ = require("underscore"),
  spawn = require("child_process").spawn,
  winston = require("winston");

var mongoose = require("mongoose"),
  HivTrace = mongoose.model("HivTrace"),
  Msa = mongoose.model("Msa");

var publisher = redis.createClient();

/**
 * Request a new job ID
 * app.post('/hivtrace/request-job-id', hivtrace.clusterForm);
 */

exports.requestID = function(req, res) {
  var hivtrace = new HivTrace();

  hivtrace.save(function(err, ht) {
    if (err) {
      res.json(500, error.errorResponse(err.message));
      return;
    }
    res.json(200, {
      id: ht._id
    });
  });
};

/**
 * Form submission page
 * app.post('/hivtrace/:id/uploadfile', hivtrace.clusterForm);
 */

exports.uploadFile = function(req, res) {
  HivTrace.findOne(
    {
      _id: req.params.id
    },
    function(err, hivtrace) {
      if (err || !hivtrace) {
        res.json(500, error.errorResponse("No HIV-TRACE ID " + id));
      } else {
        var postdata = req.body;

        if (postdata.public_db_compare == "true") {
          hivtrace.lanl_compare = true;
          hivtrace.status_stack = hivtrace.valid_lanl_statuses;
        } else {
          hivtrace.lanl_compare = false;
          hivtrace.status_stack = hivtrace.valid_statuses;
        }

        if (postdata.prealigned == "true") {
          hivtrace.prealigned = true;
          hivtrace.status_stack = hivtrace.valid_statuses.slice(2);
        } else {
          hivtrace.prealigned = false;
        }

        hivtrace.distance_threshold = Number(postdata.distance_threshold);
        hivtrace.min_overlap = Number(postdata.min_overlap);
        hivtrace.ambiguity_handling = postdata.ambiguity_handling;
        hivtrace.strip_drams = postdata.strip_drams;
        hivtrace.reference = postdata.reference;
        hivtrace.filter_edges = postdata.filter_edges;
        hivtrace.reference_strip = postdata.reference_strip;

        if (hivtrace.ambiguity_handling == "RESOLVE") {
          if (postdata.fraction == undefined) {
            hivtrace.fraction = 1;
          } else {
            hivtrace.fraction = postdata.fraction;
          }
        }

        if (postdata.receive_mail == "on") {
          hivtrace.mail = postdata.mail;
        }

        var publisher = redis.createClient(),
          channel_id = "fasta_parsing_progress_" + hivtrace._id;

        var file_path = req.files.files.file;
        var save_document = function(hivtrace) {
          publisher.publish(channel_id, "done");

          hivtrace.save(function(err, ht) {
            if (err) {
              res.json(500, error.errorResponse(err.message));
              return;
            }

            function move_cb(err, result) {
              if (err) {
                res.json(500, error.errorResponse(err.message));
              } else {
                res.json(200, ht);
              }
            }

            helpers.moveSafely(file_path, ht.filepath, move_cb);
          });
        };

        // Check if file is FASTA before moving forward
        Msa.validateFasta(
          file_path,
          function(err, result) {
            //'result' stores the array of sequences headers
            //[
            //  {
            //     'name' : sequence name
            //   }
            //]

            if (!result || result.length == 0 || err.msg) {
              res.json(500, {
                error: err.msg,
                validators: HivTrace.validators()
              });
              return;
            }

            // copy header information
            hivtrace.headers = result.map(function(s) {
              return s.name;
            });

            if (hivtrace.reference == "Custom") {
              var ref_file_name = req.files.ref_file.name;
              var ref_file_path = req.files.ref_file.path;

              Msa.validateFasta(file_path, function(err, custom_reference) {
                if (!custom_reference) {
                  res.json(500, {
                    error: ref_file_name + ":" + err.msg,
                    validators: HivTrace.validators()
                  });
                  return;
                } else {
                  // Open reference file and read it into database
                  fs.readFile(ref_file_path, function(err, data) {
                    hivtrace.custom_reference = data.toString();
                    save_document(hivtrace);
                  });
                }
              });
            } else {
              save_document(hivtrace);
            }
          },
          {
            "no-equal-length": !hivtrace.prealigned,
            "headers-only": !hivtrace.prealigned,
            "progress-callback": _.throttle(function(percentage) {
              publisher.publish(channel_id, percentage);
            }, 100)
          }
        );
      }
    }
  );
};

/**
 * Form submission page
 * app.get('/hivtrace', hivtrace.clusterForm);
 */
exports.clusterForm = function(req, res) {
  res.render("hivtrace/form.ejs", {
    validators: HivTrace.validators(),
    socket_addr: "http://" + setup.host
  });
};

/**
 * Handles a job request by the user
 * app.post('/hivtrace', hivtrace.invokeClusterAnalysis);
 */
exports.invokeClusterAnalysis = function(req, res) {
  var id = req.params.id;
  HivTrace.findOne(
    {
      _id: id
    },
    function(err, hivtrace) {
      if (err) {
        // Redisplay form with error
        res.format({
          html: function() {
            res.render("hivtrace/form.ejs", {
              error: err.error,
              validators: HivTrace.validators()
            });
          },

          json: function() {
            res.json(200, {
              result: data
            });
          }
        });
      } else {
        // TODO
      }
    }
  );
};

/**
 * Displays the page for the specified document
 * app.get('/hivtrace/:id', hivtrace.jobPage);
 */
exports.jobPage = function(req, res) {
  var id = req.params.id;

  HivTrace.findOne({ _id: id }, function(err, hivtrace) {
    if (err || !hivtrace) {
      res.json(500, error.errorResponse("hivtrace : " + id + " : missing id"));
    } else {
      if (!hivtrace.job_started) {
        var callback = function(err) {
          if (err) {
            logger.error(err);
          } else {
            logger.info("successfully connected to cluster");
          }
        };

        hivtrace.job_started = true;

        hivtrace.save((err, hivtrace) => {
          HivTrace.submitJob(hivtrace, callback);
        });
      }

      res.format({
        json: function() {
          res.json(200, hivtrace);
        },
        html: function() {
          res.render("hivtrace/jobpage.ejs", {
            hivtrace: hivtrace,
            last_status_msg: hivtrace.last_status_msg
          });
        }
      });
    }
  });
};

/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/results', hivtrace.results);
 */
exports.results = function(req, res) {
  var id = req.params.id;
  HivTrace.findOne(
    { _id: id },
    "tn93_summary tn93_results lanl_compare",
    function(err, hivtrace) {
      if (err || !hivtrace) {
        res.json(
          500,
          error.errorResponse("There is no HIV Cluster job with id of " + id)
        );
      } else {
        res.format({
          html: function() {
            res.render("hivtrace/results.ejs", { hivtrace: hivtrace });
          },
          json: function() {
            res.render("hivtrace/results.ejs", { hivtrace: hivtrace });
          }
        });
      }
    }
  );
};

/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/trace_results', hivtrace.results);
 */
exports.trace_results = function(req, res) {
  var id = req.params.id;
  HivTrace.findOne({ _id: id }, function(err, hivtrace) {
    hivtrace.addAttributesToResults(function(err, results) {
      if (err || !hivtrace) {
        res.json(
          500,
          error.errorResponse("There is no HIV-TRACE job with id of " + id)
        );
      } else {
        var options = {
          root: path.join(__dirname, "/../../uploads/hivtrace/"),
          dotfiles: "deny",
          headers: {
            "x-timestamp": Date.now(),
            "x-sent": true
          }
        };

        if (!err) {
          res.json(200, results);
        } else {
          res.sendfile(hivtrace.rel_trace_results, options, function(err) {
            if (err) {
              res.status(err.status).end();
            } else {
              console.log("sent:", hivtrace.trace_results);
            }
          });
        }
      }
    });
  });
};

exports.settings = function(req, res) {
  var id = req.params.id;

  HivTrace.findOne(
    {
      _id: id
    },
    function(err, hivtrace) {
      if (err || !hivtrace) {
        res.json(
          500,
          error.errorResponse("There is no HIV-TRACE job with id of " + id)
        );
      } else {
        res.format({
          json: function() {
            res.json(200, hivtrace);
          }
        });
      }
    }
  );
};

/**
 * An AJAX request that verifies the upload is correct
 * app.post('/msa/:id/map-attributes', msa.mapAttributes);
 */
exports.mapAttributes = function(req, res) {
  function returnError(err) {
    res.format({
      html: function() {
        res.render("hivtrace/attribute_map_assignment.ejs", {
          error: err
        });
      },
      json: function() {
        res.json(200, err);
      }
    });
  }

  function returnFormat(hivtrace, err) {
    var return_me = {
      map: hivtrace.attributes.toObject(),
      delimiter: hivtrace.delimiter,
      hivtrace_id: hivtrace._id,
      error: err
    };

    res.render("hivtrace/attribute_map_assignment.ejs", return_me);
  }

  var id = req.params.id;

  HivTrace.findOne(
    {
      _id: id
    },
    function(err, hivtrace) {
      if (err || !hivtrace) {
        returnError(err);
      } else if (hivtrace.attributes && hivtrace.attributes.length) {
        returnFormat(hivtrace, err);
      } else {
        var channel_id = "attribute_parsing_progress_" + id;

        var worker_process = spawn("node", [
            __dirname + "/../task-runners/hivtrace/attribute-mapper.js",
            id
          ]),
          err_msg = "";

        worker_process.on("error", function(err) {
          publisher.publish(channel_id, "done");
          returnError(err);
        });

        if (worker_process.stderr && worker_process.stdout) {
          worker_process.stderr.on("data", function(err) {
            err_mgs = "" + err;
          });

          worker_process.stdout.on("data", function(data) {
            publisher.publish(channel_id, +("" + data));
          });

          worker_process.on("close", function(code) {
            publisher.publish(channel_id, "done");
            if (code == 0) {
              HivTrace.findOne(
                {
                  _id: id
                },
                function(err, hivtrace) {
                  if (hivtrace.attributes && hivtrace.attributes.length) {
                    returnFormat(hivtrace, err);
                  } else {
                    returnError(
                      err
                        ? err
                        : "attribute-mapper.js error (helper process did not create an attribute map)"
                    );
                  }
                }
              );
            } else {
              returnError(
                err_msg.length ? err_msg : "attribute-mapper.js error"
              );
            }
          });
        }
      }
    }
  );
};

exports.saveAttributes = function(req, res) {
  var id = req.params.id;
  var postdata = req.body;

  HivTrace.findOne(
    {
      _id: id
    },
    function(err, hivtrace) {
      hivtrace.attributes.forEach(function(d, i) {
        d.annotation = postdata["annotation"][i];
      });

      hivtrace.combine_same_id_diff_dates = postdata["combine"];

      hivtrace.saveAttributes(function(err, hivtrace) {
        hivtrace.save(function(err, hivtrace) {
          if (err) {
            res.json(200, err);
          } else {
            res.json(200, {
              success: true
            });
          }
        });
      });
    }
  );
};

/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/attributes', hivtrace.results);
 */
exports.attributeMap = function(req, res) {
  var id = req.params.id;
  HivTrace.findOne({ _id: id }, "attribute_map", function(err, hivtrace) {
    if (err || !hivtrace) {
      res.json(
        500,
        error.errorResponse("There is no HIV Cluster job with id of " + id)
      );
    } else {
      res.json({ hivtrace: hivtrace });
    }
  });
};

/**
 * app.get('/hivtrace/:id/aligned.fasta', hivtrace.aligned_fasta);
 */
exports.aligned_fasta = function(req, res) {
  var id = req.params.id;
  HivTrace.findOne({ _id: id }, function(err, hivtrace) {
    if (err || !hivtrace) {
      res.json(
        500,
        error.errorResponse("There is no HIV-TRACE job with id of " + id)
      );
    } else {
      var options = {
        root: __dirname + "/../../uploads/hivtrace/",
        dotfiles: "deny",
        headers: {
          "x-timestamp": Date.now(),
          "x-sent": true
        }
      };

      res.sendfile(hivtrace.rel_aligned_fasta_fn, options, function(err) {
        if (err) {
          console.log(err);
          res.status(err.status).end();
        } else {
          console.log("sent:", hivtrace.rel_aligned_fasta_fn);
        }
      });
    }
  });
};

exports.getUsage = function(req, res) {
  HivTrace.usageStatistics(function(err, hivtrace) {
    res.json(200, hivtrace);
  });
};
