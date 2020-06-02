var fs = require("fs");
var request = require("request");
const { exec } = require("child_process");

function getRequest(req, callback) {
  request(req, function (err, res, body) {
    if (err) {
      console.log("error :: Request failed due to URL");
      return err;
    }
  }).pipe(fs.createWriteStream("./testFile").on("finish", callback));
}

getRequest("https://itunes.apple.com/lookup?id=909253&entity=album", function (
  err
) {
  if (err) {
    console.log("There was an error saving this file");
    return;
  }
  console.log("File Saved");
  //Open file
  var today2 = new Date();
  exec(
    "cat testFile > testResults" + today2.getMilliseconds() + " | rm testFile"
  );
});

// exports.moveSafely = function(src, dst, final_cb) {
//   var dstDir = path.dirname(dst);

//   // check if dstDir exists
//   fs.mkdir(dstDir, function(e) {
//     if (e && !(e && e.code === "EEXIST")) {
//       final_cb(e);
//     } else {
//       exports.sameDev([src, dstDir], function(err, onSame) {
//         if (err) {
//           final_cb(err);
//         } else {
//           if (onSame) {
//             fs.rename(src, dst, final_cb);
//           } else {
//             async.series(
//               [
//                 function(cb) {
//                   exports.copyFile(src, dst, cb);
//                 },
//                 function(cb) {
//                   fs.unlink(src, cb);
//                 }
//               ],
//               final_cb
//             );
//           }
//         }
//       });
//     }
//   });
// };

//ASDF

// exports.invokeDEBUG = function(req, res) {

//   /* Declare variables for later use */
//   //var url_fasta = req.body.fastaLoc;
//   var url_fasta = "https://www.dropbox.com/s/29tgjcio3z0plf5/CD2.nex?dl=1";
//   shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');
//   var fileName = "api_" + shortid.generate() + "z.nex";
//   var dest = os.tmpdir() + "/";
//   /* End Variable Declaration */

//   request(url_fasta, function(err, res, body) {
//     if(err){console.log("error :: Request failed due to URL")};
//     var today = new Date();
//     console.log("File Saved Successfully " + today.getMilliseconds());
//   }).pipe(fs.createWriteStream(dest + fileName))

//   var
//     fn = dest + fileName,

//     slac = new SLAC(),
//     postdata = req.body,
//     datatype = 0,
//     gencodeid = postdata.gencodeid;
//     slac.mail = postdata.mail;

//   Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
//     var today2 = new Date();
//     console.log("Attempting to run ParseFile " + today2.getMilliseconds());
//     if (err) {
//       res.json(500, { error: err + today2.getMilliseconds() });
//       return;
//     }
//     // Check if msa exceeds limitations
//     if (msa.sites > slac.max_sites) {
//       var error =
//         "Site limit exceeded! Sites must be less than " + slac.max_sites;
//       logger.error(error);
//       res.json(500, { error: error });
//       return;
//     }
//     if (msa.sequences > slac.max_sequences) {
//       var error =
//         "Sequence limit exceeded! Sequences must be less than " +
//         slac.max_sequences;
//       logger.error(error);
//       res.json(500, { error: error });
//       return;
//     }

//     slac.msa = msa;
//     slac.status = slac.status_stack[0];

//     slac.save(function(err, slac_result) {
//       if (err) {
//         logger.error("slac save failed");
//         res.json(500, { error: err });
//         return;
//       }

//       function move_cb(err, result) {
//         if (err) {
//           logger.error("slac rename failed" + " Errored on line 282~ within slac.js :: move_cb " + err);
//           res.json(500, { error: err });
//         } else {
//           var to_send = slac;
//           to_send.upload_redirect_path = slac.upload_redirect_path;
//           res.json(200, {
//             analysis: slac,
//             upload_redirect_path: slac.upload_redirect_path
//           });

//           // Send the MSA and analysis type
//           SLAC.submitJob(slac_result, connect_callback);
//         }
//       }

//       //FN WOULD NEED TO BE CHANGED ON INVOKE WHEN COMBINING
//       helpers.moveSafely(fn, slac_result.filepath, move_cb);

//     });

//   });

//   /* End default Invoke Code */

// }
