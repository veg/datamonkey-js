const mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
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
  HivTrace = mongoose.model("HivTrace"),
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
      req.fileExtension,
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

    /* if SLAC */
    if (postdata.method.toUpperCase() == "SLAC") {
      let options = {
        datatype: 0,
        gencodeid: postdata.gencodeid,
        mail: postdata.mail,
      };

      SLAC.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning SLAC job from API :: " + err);
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
        email: postdata.email,
        original_extension: postdata.fileExtension,
        nwk_tree: postdata.nwk_tree, //Requester provides as string
        analysis_type: postdata.analysis_type,
      };

      FEL.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning FEL job from API :: " + err);
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
        email: postdata.email,
        original_extension: postdata.fileExtension,
        nwk_tree: postdata.nwk_tree, //Requester provides as string with tags
        analysis_type: postdata.analysis_type,
      };

      ContrastFEL.spawn(fullFileName, options, (err, result) => {
        if (err) {
          logger.warn("Error with spawning CFEL job from API :: " + err);
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
        }
        res.json(200, {
          time_stamp: result.created,
          id: result._id,
          status: result.status,
          url: "dev.datamonkey.org/gard/" + result._id,
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
