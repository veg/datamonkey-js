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

  let postdata = req.body;

  var url_fasta = postdata.fastaLoc,
    fileName = "api_" + shortid.generate() + "z.nex",
    dest = os.tmpdir(),
    fullFileName = path.join(dest, fileName);

  let datatype = 0,
    gencodeid = postdata.gencodeid;

  let options = {
    datatype: 0,
    gencodeid: gencodeid,
    mail: postdata.mail,
  };

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

    SLAC.spawn(fullFileName, options, (err, result) => {
      console.log("hi, we are back");

      if (err) {
        logger.warn("ERROR WITH SPAWNING JOB :: " + err);
      }

      logger.info("Spawn done?");
    });
  });

  return;
}

exports.apiSubmit = apiSubmit;
