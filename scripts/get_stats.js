var fs = require("fs-extra"),
  _ = require("lodash"),
  moment = require("moment");

require("../app/models/absrel.js");
require("../app/models/bgm.js");
require("../app/models/busted.js");
require("../app/models/contrast-fel.js");
require("../app/models/fade.js");
require("../app/models/fel.js");
require("../app/models/fubar.js");
require("../app/models/gard.js");
require("../app/models/hivtrace.js");
require("../app/models/meme.js");
require("../app/models/msa.js");
require("../app/models/multihit.js");
require("../app/models/prime.js");
require("../app/models/relax.js");
require("../app/models/slac.js");

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

let allMethods = [
  FEL,
  ContrastFEL,
  aBSREL,
  Busted,
  BGM,
  FUBAR,
  GARD,
  MEME,
  MULTIHIT,
  Relax,
  FADE,
  SLAC,
];

// runs before all tests in this block
var db = "mongodb://127.0.0.1/datamonkey";
mongoose.connect(db);

function methodQuery(method) {
  let myPromise = new Promise((myResolve, myReject) => {
    // "Producing Code" (May take some time)
    // query all stored networks, parse out patient history, and fill cluster history
    // Date threshold
    method.find(
      { status: "completed" },
      { created: 1, _id: 1, msa: 1, results: 1 },
      (err, runs) => {
        //db.fels.find({"status":"completed"}).limit(1)[0].msa["0"].sites
        //db.fels.find({"status":"completed"}).limit(1)[0].msa["0"].sequences
        // get timer

        try {
          let runCreationDates = _.map(runs, (r) => {
            // get timer
            let runTime = null;

            try {
              runTime = r.results["timers"]["Total time"]["timer"];
            } catch {}

            return [
              r.created,
              r._id,
              r.msa["0"].sites,
              r.msa["0"].sequences,
              runTime,
            ];
          });

          let formattedRunCreationDates = _.map(runCreationDates, (r) => [
            method.modelName,
            moment(r[0]).format(),
            r[1],
            r[2],
            r[3],
            r[4],
          ]);
          myResolve(formattedRunCreationDates);
        } catch (e) {
          myReject(e);
        }
      }
    );
  });

  return myPromise;
}

allMethodQueries = _.map(allMethods, methodQuery);

Promise.all(allMethodQueries).then((results) => {
  console.log("Promises completed");

  // write all to file
  let toWrite = _.flatten(results);

  var logger = fs.createWriteStream("datamonkey_usage.csv", {
    flags: "w", // 'a' means appending (old data will be preserved)
  });

  _.each(toWrite, (row) => {
    var writeLine = (line) => logger.write(`\n${line}`);
    writeLine(row);
  });

  console.log("write completed");
  setTimeout(process.exit, 9500, 1);
});
