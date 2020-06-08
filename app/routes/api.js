var mongoose = require("mongoose"),
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
  request = require("request");
//slac = require("./slac");

function apiSubmit(req, res) {
  console.log("Incoming request recieved REQ = " + JSON.stringify(req.body));
  shortid.characters(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
  );
  var url_fasta = req.body.fastaLoc,
    fileName = "api_" + shortid.generate() + "z.nex",
    dest = os.tmpdir() + "/",
    fullFileName = dest + fileName;

  var slac = new SLAC(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;
  slac.mail = postdata.mail;

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

    console.log("SLAC OBJ = " + JSON.stringify(slac));

    SLAC.spawn(function (fullFileName, datatype, gencodeid, slac, cb) {
      if (err) {
        console.log("ERROR WITH SPAWNING JOB :: " + err);
      }
      console.log("Spawn done?");
    });
  });

  //console.log("DEBUG, did the body come through? = " + req.body.method);
  //slac.invokeDEBUG(req, res);
  return;
}

// function startInvoke(req, res, callback){
//     //Start invoke and wait for reply to give response

// }

// function apiSubmitOLD(req, res){
//     /*
//     This method will filter the incoming API submit request and route to correct
//     invoke method for the related job.
//     */
//     console.log("Incoming request recieved :: Filting process started");
//     console.log("DEBUG, did the body come through? = " + req.body.method);

//     var method_dict = {"slac":"slac"};
//     //var valid_method = req.body.method in method_dict;
//     if(req.body.method in method_dict === true){

//         //NEEDS TO BE SYNC
//         console.log("Method: " + req.body.method + " is a valid method :: Continue");
//         //This needs to be setup with dict and not if statements
//         //This will need to be ran sync'd
//         if(req.body.method == slac || (true === true)){
//             slac.invokeDEBUG;
//         }

//         //Temp response- will return job ID soon
//         res.json({
//             status: 'success',
//             body: req.body
//         })
//         //END SYNC

//     } else{
//         res.json({
//             status: 'Error',
//             body: "Provided Method: " + req.body.method + " does not exist :: API Process canceled"
//         })
//     }

// };

exports.apiSubmit = apiSubmit;

//var method = req.body.method;
//var params = req.body.parameters;
//var geneticCode = req.body.geneticCode;
