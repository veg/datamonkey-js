var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  path = require("path"),
  winston = require("winston"),
  logger = require("../../lib/logger");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  Flea = mongoose.model("Flea");

exports.form = function(req, res) {
  res.render("flea/form.ejs");
};

exports.invoke = function(req, res) {
  var postdata = req.body,
    msas = [],
    flea_files = postdata.flea_files,
    flea_tmp_dir = path.join(__dirname, "/../../uploads/flea/tmp/"),
    flea_files = JSON.parse(flea_files),
    datatype = 0,
    gencodeid = 1;

  var populateFilename = function(obj) {
    return {
      fn: flea_tmp_dir + obj.fn,
      last_modified: obj.last_modified,
      visit_code: obj.visit_code,
      visit_date: obj.visit_date
    };
  };

  flea_files = flea_files.map(populateFilename);

  if (postdata.receive_mail == "true") {
    flea.mail = postdata.mail;
  }

  // Loop through each file upload
  flea_files.forEach(function(flea_file) {
    Msa.parseFile(flea_file.fn, datatype, gencodeid, function(err, msa) {
      if (err) {
        // remove all files from tmp directory and start over
        res.render("flea/form.ejs");
      } else {
        msa.visit_code = flea_file.visit_code;
        msa.visit_date = flea_file.visit_date;
        msa.original_filename = path.basename(flea_file.fn);
        msas.push(msa);
      }

      if (msas.length == flea_files.length) {
        var flea = new Flea();
        flea.msas = msas;

        flea.save(function(err, flea_result) {
          if (err) {
            logger.error("flea save failed");
            res.json(500, { error: err });
            return;
          }

          function respond_with_json(err, result) {
            if (err) {
              logger.error("flea rename failed");
              res.json(500, { error: err });
            } else {
              // Send the MSA and analysis type
              //
              var connect_callback = function(err, result) {
                logger.log(result);
              };

              var stream = Flea.pack(flea);

              stream.on("close", function() {
                res.json(200, { flea: flea });
              });

              Flea.submitJob(flea_result, connect_callback);
            }
          }

          // wait until all files have been moved before sending json response
          var count = 1;
          var was_error = false;

          var move_cb = function(err, result) {
            count = count + 1;
            if (err) {
              was_error = true;
            } else {
              if (count == flea_files.length || flea_files.length == 1) {
                if (err) {
                  respond_with_json("failure", "");
                } else {
                  respond_with_json("", true);
                }
              }
            }
          };

          msas.forEach(function(flea_file) {
            var current_location = flea_tmp_dir + flea_file.original_filename;
            var final_dest = flea_result.filedir + flea_file._id + ".fastq";
            helpers.moveSafely(current_location, final_dest, move_cb);
          });
        });
      }
    });
  });
};

/**
 * Displays id page for analysis
 * app.get('/flea/:id', flea.getFlea);
 */
exports.getPage = function(req, res) {
  // Find the analysis
  // Return its results
  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({ _id: fleaid }, function(err, flea) {
    if (err || !flea) {
      res.json(500, error.errorResponse("Invalid ID : " + fleaid));
    } else {
      if (flea.status != "completed") {
        flea.filesize(function(err, bytes) {
          res.render("flea/jobpage.ejs", {
            job: flea,
            size: bytes
          });
        });
      } else {
        var html_dir = "./public/assets/lib/";
        res.sendfile(path.resolve(html_dir, "flea/dist/index.html"));
      }
    }
  });
};

/**
 * Displays id page for analysis
 */
exports.restart = function(req, res) {
  // Find the analysis
  // Return its results
  var fleaid = req.params.id;

  var connect_callback = function(err, result) {
    logger.log(result);
  };

  //Return all results
  Flea.findOne({ _id: fleaid }, function(err, flea) {
    if (err || !flea) {
      res.json(500, error.errorResponse("invalid id : " + fleaid));
      return;
    } else {
      flea.status = "running";

      flea.save(function(err, flea_result) {
        res.redirect("/flea/" + fleaid);

        var connect_callback = function(err, result) {
          logger.log(result);
        };

        Flea.submitJob(flea_result, connect_callback);
      });
    }
  });
};

exports.getSessionJSON = function(req, res) {
  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({ _id: fleaid }, function(err, flea) {
    if (err || !flea) {
      res.json(500, error.errorResponse("invalid id : " + fleaid));
      return;
    } else {
      fs.readFile(flea.session_json_fn, (err, data) => {
        if (err) {
          res.json(
            500,
            error.errorResponse("couldn't read session json file: " + fleaid)
          );
          return;
        }

        try {
          var session_data = JSON.parse(String(data));
          session_data["session_id"] = fleaid;

          fs.readFile(flea.predefined_regions, (err, predefined_region) => {
            if (err) {
              res.json(
                500,
                error.errorResponse(
                  "couldn't read predefined_regions file: " + fleaid
                )
              );
              return;
            }

            fs.readFile(flea.pdb_structure, (err, pdb_structure) => {
              if (err) {
                res.json(
                  500,
                  error.errorResponse("couldn't read pdb file: " + fleaid)
                );
                return;
              }

              try {
                var regions_json = JSON.parse(predefined_region);
                var pdb_lines = String(pdb_structure);
                session_data["predefined_regions"] = regions_json["regions"];
                session_data["pdb"] = pdb_lines.split("\n");
                res.json(200, session_data);
                return;
              } catch (e) {
                res.json(
                  500,
                  error.errorResponse(
                    "couldn't pdb or region read file: " + fleaid
                  )
                );
                return;
              }
            });
          });
        } catch (e) {
          res.json(500, error.errorResponse("couldn't read file: " + fleaid));
          return;
        }
      });
    }
  });
};

exports.getSessionZip = function(req, res) {
  var fleaid = req.params.id;
  //Return all results
  Flea.findOne({ _id: fleaid }, function(err, flea) {
    if (err || !flea) {
      res.json(500, error.errorResponse("invalid id : " + fleaid));
    } else {
      res.sendfile(path.resolve(flea.session_zip_fn));
    }
  });
};
