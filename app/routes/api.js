const mongoose = require("mongoose"),
  FEL = mongoose.model("FEL"),
  ContrastFEL = mongoose.model("ContrastFEL"),
  aBSREL = mongoose.model("aBSREL"),
  Busted = mongoose.model("Busted"),
  BGM = mongoose.model("BGM"),
  FUBAR = mongoose.model("FUBAR"),
  GARD = mongoose.model("GARD"),
  MEME = mongoose.model("MEME"),
  MULTIHIT = mongoose.model("MULTIHIT"),
  Relax = mongoose.model("Relax"),
  FADE = mongoose.model("Fade"),
  API = mongoose.model("API"),
  SLAC = mongoose.model("SLAC");

const shortid = require("shortid"),
  os = require("os"),
  path = require("path"),
  request = require("request"),
  setup = require("./../../config/setup"),
  _ = require("underscore"),
  logger = require("../../lib/logger");

/*
 * Submit a job via API
 */
function apiSubmit(req, res) {
  logger.info("Incoming request recieved REQ = " + JSON.stringify(req.body));

  shortid.characters(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
  );

  var website_url = setup.api_base_url, //Used to build reply URL
    postdata = req.body,
    url_fasta = postdata.fastaLoc,
    today = new Date(),
    fileName =
      "api_" +
      shortid.generate() +
      today.getMilliseconds() +
      "." +
      postdata.fileExtension,
    dest = os.tmpdir(),
    fullFileName = path.join(dest, fileName);

  function headRequest(url, cb) {
    request(
      {
        method: "HEAD",
        uri: url,
      },
      function (err, response) {
        if (err) {
          var error =
            "error: with retrieving HEAD request for content-length please ensure your file location provides this. ERR: " +
            err;
          cb(error);
          return;
        }
        if (response.headers["content-length"] > setup.api_max_file_size) {
          var error =
            "Error: Requested download file is too large. Max is currently set to " +
            setup.api_max_file_size +
            "bytes";
          cb(error);
          return;
        } else {
          cb();
          return;
        }
      }
    );
  }

  function getRequest(url, dest, callback) {
    headRequest(url, function (err) {
      if (err) {
        logger.warn("error :: File size too large for request");
        return callback(err);
      }
      request(url, function (err) {
        if (err) {
          logger.warn("error :: Request failed due to URL");
          return callback(err);
        }
      }).pipe(fs.createWriteStream(dest).on("finish", callback));
    });
  }

  getRequest(url_fasta, fullFileName, function (err) {
    if (err) {
      logger.warn("There was an error saving this file to " + fullFileName);
      res.json(400, {
        error: err,
      });
      return;
    }

    logger.info("File Saved to " + fullFileName);

    var switch_method = "";
    try {
      switch_method = postdata.method.toUpperCase();
    } catch (err) {
      res.json(400, {
        error: "Method is null, undefined, or not in correct format",
      });
      return;
    }

    switch (switch_method) {
      case "FEL": {
        /* if FEL */
        /* User must provide branch selection */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          ds_variation: postdata.ds_variation,
          original_extension: postdata.fileExtension,
          nwk_tree: postdata.nwk_tree, //Requester provides as string
          analysis_type: postdata.analysis_type,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        FEL.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning FEL job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "CONTRAST-FEL": {
        /* 
        if contrast-FEL
        User must provide branch selection
        Branch tags should be included in NWK
        Use http://phylotree.hyphy.org/ to assit in NWK tagging  
        */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          ds_variation: postdata.ds_variation,
          original_extension: postdata.fileExtension,
          nwk_tree: postdata.nwk_tree, //Requester provides as string with tags
          analysis_type: postdata.analysis_type,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        ContrastFEL.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning CFEL job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + "contrast_fel" + "/" + result._id,
          });
        });
        break;
      }
      case "CONTRASTFEL": {
        /* 
        Catch condition if given contrastfel vs contrast-fel
        if contrastFEL 
        User must provide branch selection
        Branch tags should be included in NWK
        Use http://phylotree.hyphy.org/ to assit in NWK tagging  
        */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          ds_variation: postdata.ds_variation,
          original_extension: postdata.fileExtension,
          nwk_tree: postdata.nwk_tree, //Requester provides as string with tags
          analysis_type: postdata.analysis_type,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        ContrastFEL.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning CFEL job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + "contrast_fel" + "/" + result._id,
          });
        });
        break;
      }
      case "ABSREL": {
        /* if aBSREL */
        /* User must provide branch selection */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          nwk_tree: postdata.nwk_tree, //Requester provides as string
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        aBSREL.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning aBSREL job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }
      case "BUSTED": {
        /* if Busted */
        /* User must provide branch selection */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          nwk_tree: postdata.nwk_tree, //Requester provides as string
          ds_variation: postdata.ds_variation,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        Busted.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning BUSTED job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "BGM": {
        /* if BGM */
        let options = {
          datatype: postdata.datatype,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          length_of_each_chain: postdata.length_of_each_chain,
          substitution_model: postdata.substitution_model,
          number_of_burn_in_samples: postdata.number_of_burn_in_samples,
          number_of_samples: postdata.number_of_samples,
          maximum_parents_per_node: postdata.maximum_parents_per_node,
          minimum_subs_per_site: postdata.minimum_subs_per_site,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        BGM.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning BGM job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "FUBAR": {
        /* if FUBAR */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          number_of_grid_points: postdata.number_of_grid_points,
          number_of_mcmc_chains: postdata.number_of_mcmc_chains,
          length_of_each_chain: postdata.length_of_each_chain,
          number_of_burn_in_samples: postdata.number_of_burn_in_samples,
          number_of_samples: postdata.number_of_samples,
          concentration_of_dirichlet_prior:
            postdata.concentration_of_dirichlet_prior,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        FUBAR.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning FUBAR job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "GARD": {
        /* if GARD */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          site_to_site_variation: postdata.site_to_site_variation.toLowerCase(),
          rate_classes: postdata.rate_classes,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        GARD.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning GARD job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "MEME": {
        /* if MEME */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        MEME.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning MEME job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "MULTIHIT": {
        /* if MULTIHIT */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          rate_classes: postdata.rate_classes,
          triple_islands: postdata.triple_islands,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        MULTIHIT.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning MULTIHIT job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "RELAX": {
        /* if Relax */
        /* User must provide branch selection */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
          nwk_tree: postdata.nwk_tree, //Requester provides as string
          analysis_type: postdata.analysis_type, //1 or 2 <-- no 0
          fileExtension: postdata.fileExtension,
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        Relax.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning Relax job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "FADE": {
        /* if FADE */
        let options = {
          mail: postdata.mail || "",
          number_of_grid_points: postdata.number_of_grid_points,
          number_of_mcmc_chains: postdata.number_of_mcmc_chains,
          length_of_each_chain: postdata.length_of_each_chain,
          number_of_burn_in_samples: postdata.number_of_burn_in_samples,
          number_of_samples: postdata.number_of_samples,
          concentration_of_dirichlet_prior:
            postdata.concentration_of_dirichlet_prior,
          substitution_model: postdata.substitution_model,
          posterior_estimation_method: postdata.posterior_estimation_method,
          //datatype: 2, //Hard coded in orignal invoke
          //gencodeid: 1, //Hard coded in original invoke
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        FADE.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning FADE job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      case "SLAC": {
        /* if SLAC */
        let options = {
          datatype: 0,
          gencodeid: postdata.gencodeid,
          mail: postdata.mail || "",
        };

        for (let prop in options) {
          if (
            _.propertyOf(options)(prop) == "undefined" ||
            _.propertyOf(options)(prop) == null
          ) {
            res.json(400, {
              error:
                "ERROR, NULL OR UNDEFINED PROPERTY IN REQUEST INVALID PROP INCLUDED IN BODY ",
              prop,
            });
            return;
          }
        }

        SLAC.spawn(fullFileName, options, (err, result) => {
          if (err) {
            logger.warn("Error with spawning SLAC job from API :: " + err);
            res.json(400, {
              error: err,
            });
          }
          recordJob(website_url, postdata.api_key, postdata.method, result._id);
          res.json(200, {
            time_stamp: result.created,
            id: result._id,
            status: result.status,
            url: website_url + "/" + postdata.method + "/" + result._id,
          });
        });
        break;
      }

      default:
        /* if Method Not Listed Above */
        logger.warn(
          "Invalid Method given or method not supported :: " + postdata.method
        );
        res.json(500, {
          error:
            "Invalid Method given or method not supported :: " +
            postdata.method,
        });
    }
  });

  return;
}

/*
 * Get status of running job
 */
exports.apiStatus = function apiSubmit(req, res) {
  var analysis = require("./analysis.js"),
    postdata = req.body;

  let options = {
    method: postdata.method,
    id: postdata.id,
  };

  analysis.getInfoApi(options, (err, result) => {
    var website_url = "datamonkey.org";
    if (err) {
      var error =
        "Error with displaying Info for Job ID: " + options.id + " :: " + err;
      logger.warn(error);
      res.json(400, {
        error: error,
      });
      return;
    }

    try {
      res.json(200, {
        time_stamp: result.created,
        completion: result.creation_time,
        id: result._id,
        status: result.status,
        url: website_url + "/" + options.method + "/" + result._id,
      });
    } catch (err) {
      res.json(400, {
        error: "No results found",
      });
    }
  });
};

/*
 * Check if user API key is valid
 */
exports.checkAPIKey = function checkAPIKey(req, res, next) {
  var id = req.body.api_key;

  //Dev bypass, will not log jobs as no key found.
  if (setup.api_dev_mode === true) {
    next();
    return;
  }

  API.findById(id, function (err, info) {
    if (err || !info) {
      res.json(500, "invalid id : " + id);
      return;
    } else {
      if (info.job_request_made > info.job_request_limit) {
        res.json(500, "Job limit exceeded for this API key " + id);
        return;
      } else if (Date.now() > info.expires) {
        res.json(500, "Time has expired for this API key " + id);
        return;
      } else {
        info.iterate_job_count;
        info.save();
        next();
        return;
      }
    }
  });
};

/*
 * Add Job to API key
 */
function recordJob(website, id, method, job_id) {
  //Dev bypass, will not log jobs as no key found.
  if (setup.api_dev_mode === true) {
    return;
  }

  API.findById(id, function (err, info) {
    if (err || !info) {
      logger.warn("Failed to add job ID to API key, API key not found");
      return;
    } else {
      //log job
      info.associated_job_ids.push(website + "/" + method + "/" + job_id);
      info.save();
    }
  });
}

/*
 * Creates new API key
 */
exports.issueKey = function issueKey(req, res) {
  var api = new API();
  api.save();
  res.json(200, JSON.stringify(api._id));
  return;
};

/*
 * Check if capcha key was given
 */
exports.checkCapcha = function checkCapcha(req, res, next) {
  const PRIVATE_KEY = setup.api_recapcha_pri;
  var captcha_obj = { secret: PRIVATE_KEY, response: req.body.cap };

  request.post(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      form: captcha_obj,
    },
    (error, response, body) => {
      if (error) {
        res.json(417, "Error with verification request");
        return;
      }
      if (JSON.parse(body).success == true) {
        next();
        return;
      } else {
        res.json(417, "Invalid Capcha");
        return;
      }
    }
  );
};

/*
 * Check API Key's information
 */
exports.keyInfo = function keyInfo(req, res) {
  var id = req.body.api_key;
  API.findById(id, function (err, info) {
    if (err || !info) {
      res.json(500, "invalid id : " + id + " err = " + err);
      return;
    } else {
      if (info.job_request_made > info.job_request_limit) {
        res.json(500, "Job limit exceeded for this API key " + id);
        return;
      } else if (Date.now() > info.expires) {
        res.json(500, "Time has expired for this API key " + id);
        return;
      } else {
        info.remaining_jobs;
        res.json(200, info);
        return;
      }
    }
  });
};

exports.renderApi = function (req, res) {
  res.render("api.ejs", { captchaKey: setup.api_recaptcha_public_key });
};

exports.renderApiKeyInfo = function (req, res) {
  res.render("api.ejs", { captchaKey: setup.api_recaptcha_public_key });
};

exports.renderApiKeyLookup = function (req, res) {
  res.render("api.ejs", { captchaKey: setup.api_recaptcha_public_key });
};

exports.apiSubmit = apiSubmit;
