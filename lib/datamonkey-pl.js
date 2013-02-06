var sqlite3 = require('sqlite3').verbose();
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var mongoose = require('mongoose')
  , SequenceAlignmentFile = mongoose.model('SequenceAlignmentFile');

var host = 'datamonkey-dev';
var SPOOL_DIR = "/var/lib/datamonkey/www/spool/";

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
      host: host,
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
        spool_path = SPOOL_DIR + fn + '.cache';

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

    // Ensure the params are correct
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
      host: host,
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
      //result.on('data', function (chunk) { console.log(chunk) });

      result.on('end', function () {
        res.send({ "id": memeid, "success":1});
      });

  });

  // post the data
  postreq.write(analysisparams);
  postreq.end();
}

exports.parseCurrentStatus = function (analysis, res) {

  //Get filename of parent sequence file

  //First check what the current status is. If it is "Finished", then do no proceed
  if (analysis.status == globals.finished) {
    console.log("This job is finished");
    return globals.finished;
  }

  else if (analysis.status == globals.cancelled) {
    console.log("This job was cancelled");
    return globals.canceled;
  }

  //State is currently queued or running
  else {

    //If PHP file exists
    if (fs.existsSync(SPOOL_DIR + fn + "_meme.php")) {
      new_status = globals.finished;
    }
    
    //If TXT file exists
    else if (fs.existsSync(SPOOL_DIR + fn + "_meme.txt")) {
      new_status = globals.running;
    }

    //Must be queued
    else {
      new_status = globals.queue;
    }

    //Update the status for the analysis
    var condition = { "_id" : analysis._id };
    var options = { multi: false };
    analysis.update( condition, update, options, function (err, result) {
      if (err) {res.send({ 'error': err }); }    
    });

  }

}

