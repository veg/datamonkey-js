var sqlite3 = require('sqlite3').verbose();
var querystring = require('querystring');
var http = require('http');
var globals = require('../config/globals.js');
var mailer = require('./mailer.js');

var dme = require('./datamonkey-event.js');

var mongoose = require('mongoose')
  , Meme = mongoose.model('Meme')
  , MemeResults = mongoose.model('MemeResults')
  , MemeMappings = mongoose.model('MemeMappings')
  , MemeSummary = mongoose.model('MemeSummary')
  , SequenceAlignmentFile = mongoose.model('SequenceAlignmentFile');

//Posting to the old perl scripts should
//be its own separate directory
exports.uploadToPerl = function (sf,res) {

    //Takes a Sequence object in mongodb and uploads it to datamonkey

    //This all needs to be in its function
    var crlf = "\r\n";
    var boundary = '---------------------------10102754414578508781458777923'; // Boundary: "--" + up to 70 ASCII chars + "\r\n"
    var delimiter = crlf + "--" + boundary;
    var preamble = ""; // ignored. a good place for non-standard mime info
    var epilogue = ""; // ignored. a good place to place a checksum, etc
    var closeDelimiter = delimiter + "--";

    //TODO: Fix filename parameter
    var fn_multipart_headers = [
      'Content-Disposition: form-data; name="upfile"; filename="HIV_gp120.nex"' + crlf,
      'Content-Type : application/octet-stream' + crlf,
    ];

    var datatype_multipart_headers = [
      'Content-Disposition: form-data; name="datatype"' + crlf,
    ];

    var code_multipart_headers = [
      'Content-Disposition: form-data; name="code"' + crlf,
    ];

    var multipartBody; // = preamble + encapsulation + closeDelimiter + epilogue + crlf /* node doesn't add this */;

    multipartBody = Buffer.concat([

      new Buffer(preamble + delimiter + crlf + fn_multipart_headers.join('') + crlf),
      new Buffer(sf.contents),

      new Buffer(preamble + delimiter + crlf + datatype_multipart_headers.join('') + crlf),
      new Buffer(sf.datatype.toString()),

      new Buffer(preamble + delimiter + crlf + code_multipart_headers.join('') + crlf),
      new Buffer(sf.genCodeId.toString()),
      new Buffer(closeDelimiter + epilogue),

    ]);

    headers = {
      'Accept-Encoding': 'gzip,deflate',
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': multipartBody.length
    }

    //The url we want is `www.datamonkey.org/`
    var options = {
      host: globals.host,
      path: '/cgi-bin/datamonkey/upload.pl',
      headers: headers,
      method: 'POST'
    };

    //Make sure we get a 200 response?
    callback = function(response) {
      var str = ''

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        //Write back to the user
        //Read 21 sequences and 566 codon alignment columns and 1 partitions.

        //Get the filename from the returned string

        //"<b>Job ID:</b>upload.42944264749561.1 <a class"
        var regex = '/.*Job ID:<\.b>(.*) <a.*/'
        var result = str.match(regex);
        var fn = result[1]; 

        //Open file sqlite file and populate mongodb
        spool_path = globals.spooldir + fn + '.cache';

        var spooldb = new sqlite3.Database(spool_path);

        spooldb.each("SELECT * FROM FILE_INFO", function(err, row) {

          var condition = { "_id" : sf._id };

          var update =  { $set: { 
              uploadfn : fn,
              partitions : row.Partitions,
              sites : row.Sites,
              rawSites : row.RawSites,
              sequences : row.Sequences,
              goodTree : row.GoodTree,
              nj : row.NJ
           }};

          var options = { multi: false };

          //Should check the postdata before
          SequenceAlignmentFile.update( condition, update, options, function (err, result) {
            if (err) {
              res.send({ 'error': err });
            } else {
              console.log('Success: ' + JSON.stringify(result));
              res.send({"_id" : sf._id});
            }
          });
        });
      });
    }

    var req = http.request(options, callback);

    //This is the data we are posting, it needs to be a string or a buffer
    req.write(multipartBody);
    req.end();

}

exports.dispatchAnalysis = function (memeid, msaf, params, res) {

  // TODO: Ensure the params are correct
  // Look up SequenceFile information
  // Build the post string from an object
  // Need to ensure that we have all of these variables
  var analysisparams = querystring.stringify({
    'filename'      : msaf.uploadfn,
    'genCodeID'     : msaf.genCodeId,
    'sequences'     : msaf.sequences,
    'sites'         : msaf.sites,
    'partitions'    : msaf.partitions,
    'method'        : params.method,
    'treeMode'      : params.treemode,
    'root'          : params.root,
    'modelString'   : params.modelstring,
    'NamedModels'   : params.namedmodels,
    'rOptions'      : params.roptions,
    'dNdS'          : params.dnds,
    'ambChoice'     : params.ambchoice,
    'pValue'        : params.pvalue,
    'rateOption'    : params.rateoption,
    'rateClasses'   : params.rateclasses,
    'rateOption2'   : params.rateoption2,
    'rateClasses2'  : params.rateclasses2,
  });


  // An object of options to indicate where to post to
  var postoptions = {
      host: globals.host,
      port: '80',
      path: '/cgi-bin/datamonkey/dispatchAnalysis.pl',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': analysisparams.length
      }
  };

  // Set up the request
  var postreq = http.request(postoptions, function(result) {
    result.setEncoding('utf8');

    result.on('end', function () {
      res.send({ "id": memeid, "success":1});

      // This job has been successfully submitted.
      // Spawn the event listener for updating the status
      Meme.findOne({_id : memeid}, function(err, item) {

      if (err)
         res.send('There is no sequence with id of ' + req.memeid);

       else {
          //Start polling job status
          dme.jobListener.start(globals.types.meme, item);

          dme.jobListener.on('status', function(self,analysis,msa) {

            if (analysis.status == globals.finished || analysis.status == globals.cancelled) {

              //The job has been completed in some way. Parse the results(if any)
              parseResults(analysis);

              //If mail is enabled. Mail the issue that the job is complete.
              if(analysis.sendmail != undefined && msa.mailaddr != undefined)
              {
                if (msa.mailaddr != undefined)
                  mailer.send(msa.mailaddr);  
              }
            }
          });
        }
      });
    });
  });

  // post the data
  postreq.write(analysisparams);
  postreq.end();
}

parseResults = function (analysis) {
  //Open SQLite file and put them in mongodb
  //Open file sqlite file and populate mongodb

  //TODO: Make agnostic
  meme = analysis;

  SequenceAlignmentFile.findOne({_id : analysis.msafn}, function(err, msa) {

    spool_path = globals.spooldir + msa.uploadfn + '.cache';

    //TODO: Only when debugging
    console.log(spool_path);

    var spooldb = new sqlite3.Database(spool_path);

    //MEME Results
    spooldb.each("SELECT * FROM MEME_RESULTS", function(err, row) {

      var memeresults = new MemeResults({
          codon   : row.Codon,
          beta1   : row.beta1,
          p1      : row.p1,
          beta2   : row.beta2,
          p2      : row.p2,
          alpha   : row.alpha,
          lrt     : row.LRT,
          pvalue  : row.pvalue,
          logl    : row.logl,
          qvalue  : row.qvalue
      });

      memeresults.save(function (err,result) {
        if (err) return handleError(err);
        meme.results.push(memeresults);
        meme.save();
      });
    });

    //Mappings
    spooldb.each("SELECT * FROM MEME_MAPPINGS", function(err, row) {

      var mememappings = new MemeMappings({
        tree     : row.Tree,
        codon    : row.Codon,
        branch   : row.Branch,
        pp       : row.PP,
        ebf      : row.EBF,
        syn      : row.Syn,
        nonsyn   : row.Nonsyn
      });

      meme.save(function (err,result) {
        if (err) return handleError(err);
        meme.mappings.push(mememappings);
        meme.save();
      });
    });

    //Summary
    spooldb.each("SELECT * FROM MEME_SUMMARY", function(err, row) {

      var memesummary = new MemeSummary({
        col_key   : row.COL_KEY,
        col_value : row.COL_VALUE
      });

      meme.save(function (err,result) {
        if (err) return handleError(err);
        meme.summary.push(memesummary);
        meme.save();
      });
    });
  });
}

exports.parseResults = parseResults;
