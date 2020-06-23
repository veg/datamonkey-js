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
  SLAC = mongoose.model("SLAC");

const shortid = require("shortid"),
  os = require("os"),
  request = require("request"),
  logger = require("../../lib/logger");

function apiSubmit(req, res) {
  logger.info("Incoming request recieved REQ = " + JSON.stringify(req.body));

  shortid.characters(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
  );

  var postdata = req.body,
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

  function getRequest(url, dest, callback) {
    request(url, function (err) {
      if (err) {
        logger.warn("error :: Request failed due to URL");
        return err;
      }
    }).pipe(fs.createWriteStream(dest).on("finish", callback));
  }

  getRequest(url_fasta, fullFileName, function (err) {
    if (err) {
      logger.warn("There was an error saving this file to " + fullFileName);
      return;
    }

    logger.info("File Saved to " + fullFileName);

    if (postdata.method.toUpperCase() == "SLAC") {
      /* if SLAC */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
      };

      SLAC.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning SLAC job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/slac/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "MEME") {
      /* if MEME */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
      };

      MEME.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning MEME job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/meme/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "FUBAR") {
      /* if FUBAR */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        number_of_grid_points: postdata.number_of_grid_points,
        number_of_mcmc_chains: postdata.number_of_mcmc_chains,
        length_of_each_chain: postdata.length_of_each_chain,
        number_of_burn_in_samples: postdata.number_of_burn_in_samples,
        number_of_samples: postdata.number_of_samples,
        concentration_of_dirichlet_prior:
          postdata.concentration_of_dirichlet_prior,
      };

      FUBAR.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning FUBAR job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/fubar/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "FEL") {
      /* if FEL */
      /* User must provide branch selection */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        ds_variation: postdata.ds_variation,
        original_extension: postdata.fileExtension,
        nwk_tree: postdata.nwk_tree, //Requester provides as string
        analysis_type: postdata.analysis_type,
      };

      FEL.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning FEL job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/fel/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "CONTRAST-FEL") {
      /* 
      if contrast-FEL
      User must provide branch selection
      Branch tags should be included in NWK
      Use http://phylotree.hyphy.org/ to assit in NWK tagging  
      */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        ds_variation: postdata.ds_variation,
        original_extension: postdata.fileExtension,
        nwk_tree: postdata.nwk_tree, //Requester provides as string with tags
        analysis_type: postdata.analysis_type,
      };

      ContrastFEL.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning CFEL job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/contrast_fel/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "GARD") {
      /* if GARD */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        site_to_site_variation: postdata.site_to_site_variation.toLowerCase(),
        rate_classes: postdata.rate_classes,
      };

      GARD.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning GARD job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/gard/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "MULTIHIT") {
      /* if MULTIHIT */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        rate_classes: postdata.rate_classes,
        triple_islands: postdata.triple_islands,
      };

      MULTIHIT.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning MULTIHIT job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/multihit/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "ABSREL") {
      /* if aBSREL */
      /* User must provide branch selection */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        nwk_tree: postdata.nwk_tree, //Requester provides as string
      };

      aBSREL.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning aBSREL job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/absrel/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "BUSTED") {
      /* if Busted */
      /* User must provide branch selection */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        nwk_tree: postdata.nwk_tree, //Requester provides as string
        ds_variation: postdata.ds_variation,
      };

      Busted.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning BUSTED job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/busted/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "RELAX") {
      /* if Relax */
      /* User must provide branch selection */
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
        nwk_tree: postdata.nwk_tree, //Requester provides as string
        analysis_type: postdata.analysis_type, //1 or 2 <-- no 0
        fileExtension: postdata.fileExtension,
      };

      Relax.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning Relax job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/relax/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "FADE") {
      /* if MEME */
      let options = {
        mail: postdata.mail,
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
        //gencodeid: 1, // Hard coded in original invoke
      };

      FADE.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning FADE job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/fade/" + result._id,
        });
      });
    } else if (postdata.method.toUpperCase() == "BGM") {
      /* if MEME */
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

      BGM.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning BGM job from API :: " + err);
          res.json(400, {
            error: err,
          });
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/bgm/" + result._id,
        });
      });
    } else {
      /* if Method Not Listed Above */
      logger.warn(
        "Invalid Method given or method not supported :: " + postdata.method
      );
      res.json(500, {
        error:
          "Invalid Method given or method not supported :: " + postdata.method,
      });
    }
  });

  return;
}

exports.apiSubmit = apiSubmit;
