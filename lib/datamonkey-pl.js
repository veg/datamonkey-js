/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var sqlite3     = require('sqlite3');
var querystring = require('querystring');
var http        = require('http');
var globals     = require('../config/globals.js');
var mailer      = require('./mailer.js');
var dme         = require('./datamonkey-event.js');
var error       = require('./error.js');
var helpers     = require('./helpers.js');

var mongoose = require('mongoose'), 
  Msa = mongoose.model('Msa');

function composeMultipartBody(boundary, msa) {
  //Takes a Sequence object in mongodb and uploads it to datamonkey

  //This all needs to be in its function
  var crlf = "\r\n";
  var delimiter = crlf + "--" + boundary;
  var preamble = ""; // ignored. a good place for non-standard mime info
  var epilogue = ""; // ignored. a good place to place a checksum, etc
  var closeDelimiter = delimiter + "--";

  //TODO: Fix filename parameter
  var fn_multipart_headers = [
    'Content-Disposition: form-data; name="upfile"; filename="HIV_gp120.nex"'
    + crlf,
    'Content-Type : application/octet-stream' + crlf,
  ];

  var datatype_multipart_headers = [
    'Content-Disposition: form-data; name="datatype"' + crlf,
  ];

  var code_multipart_headers = [
    'Content-Disposition: form-data; name="code"' + crlf,
  ];

  // = preamble + encapsulation + closeDelimiter + epilogue + crlf
  var multipartBody; 

  multipartBody = Buffer.concat([
    new Buffer(preamble + delimiter + crlf + fn_multipart_headers.join('') 
               + crlf),
    new Buffer(msa.contents),
    new Buffer(preamble + delimiter + crlf + 
               datatype_multipart_headers.join('') + crlf),
    new Buffer(msa.datatype.toString()),
    new Buffer(preamble + delimiter + crlf + code_multipart_headers.join('') 
               + crlf),
    new Buffer(msa.gencodeid.toString()),
    new Buffer(closeDelimiter + epilogue),

  ]);

  return multipartBody;

}

//Posting to the old perl scripts should
//be its own separate directory
exports.uploadToPerl = function (sf, res) {

  //Make sure we get a 200 response?
  var callback = function (response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      //Write back to the user

      //Open file sqlite file and populate mongodb
      //Get the filename from the returned string
      //"<b>Job ID:</b>upload.42944264749561.1 <a class"
      try {
        var regex = '/.*Job ID:<\.b>(.*) <a.*/',
          result = str.match(regex),
          fn = result[1];
      } catch (err) {
        //There must be an error in the file
        res.json(500, error.errorResponse(str));
        return;
      }

      var spool_path = globals.spooldir + fn + '.cache',
        spooldb = new sqlite3.Database(spool_path);

      spooldb.each("SELECT * FROM FILE_INFO", function (err, row) {

        var condition = { "_id" : sf._id };

        var update =  { $set: { 
            msaid      : fn,
            partitions : row.Partitions,
            sites      : row.Sites,
            rawsites   : row.RawSites,
            sequences  : row.Sequences,
            goodtree   : row.GoodTree,
            nj         : row.NJ
         }};

        var options = { multi: false };

        //Should check the postdata before
        Msa.findByIdAndUpdate(condition, update, options, function (err, result) {
          if (err) {
            res.json(500, error.errorResponse(err));
            return;
          } else {
            result//This should be a model method
            clipped_msa = {
              gencodeid  : result.gencodeid,
              datatype   : result.datatype,
              msaid      : result.msaid,
              partitions : result.partitions,
              sites      : result.sites,
              rawsites   : result.rawsites,
              sequences  : result.sequences,
              goodtree   : result.goodtree,
              nj         : result.nj,
              timestamp  : result.timestamp,
              mailaddr   : result.mailaddr
            }

            res.json(clipped_msa);
            return;
          }
        });
      });
    });
  }

  // Boundary: "--" + up to 70 ASCII chars + "\r\n"
  var boundary = '---------------------------10102754414578508781458777923';
  var multipartBody = composeMultipartBody(boundary, sf);

  var headers = {
    'Accept-Encoding' : 'gzip,deflate',
    'Content-Type'    : 'multipart/form-data; boundary=' + boundary,
    'Content-Length'  : multipartBody.length
  }

  //The url we want is `www.datamonkey.org/`
  var options = {
    host          : globals.host,
    path          : '/cgi-bin/datamonkey/upload.pl',
    headers       : headers,
    method        : 'POST'
  };

  //This is the data we are posting, it needs to be a string or a buffer
  var req = http.request(options, callback);
  req.write(multipartBody);
  req.end();

}

exports.dispatchAnalysis = function (analysis, type, msaf, params, res) {

  var Analysis = mongoose.model(type.capitalize());

  // TODO: Ensure the params are correct
  // Look up SequenceFile information
  // Build the post string from an object
  // Need to ensure that we have all of these variables
  var analysisparams = querystring.stringify({
    'filename'              : msaf.msaid,
    'genCodeID'             : msaf.gencodeid,
    'sequences'             : msaf.sequences,
    'sites'                 : msaf.sites,
    'partitions'            : msaf.partitions,
    'method'                : params.method,
    'treeMode'              : params.treemode,
    'prime_property_choice' : params.prime_property_choice,
    'root'                  : params.root,
    'modelString'           : params.modelstring,
    'NamedModels'           : params.namedmodels,
    'rOptions'              : params.roptions,
    'dNdS'                  : params.dnds,
    'ambChoice'             : params.ambchoice,
    'pValue'                : params.pvalue,
    'rateOption'            : params.rateoption,
    'rateClasses'           : params.rateclasses,
    'rateOption2'           : params.rateoption2,
    'rateClasses2'          : params.rateclasses2,
  });

  // An object of options to indicate where to post to
  var postoptions = {
      host               : globals.host,
      port               : '80',
      path               : '/cgi-bin/datamonkey/dispatchAnalysis.pl',
      method             : 'POST',
      headers            : {
        'Content-Type'   : 'application/x-www-form-urlencoded',
        'Content-Length' : analysisparams.length
      }
  };

  // Set up the request
  var postreq = http.request(postoptions, function(result) {
    var str = ''
    result.setEncoding('utf8');

    res.on('data', function (chunk) {
      str = str + chunk;
    });

    result.on('end', function () {

      res.json(analysis);

      // This job has been successfully submitted.
      // Spawn the event listener for updating the status
      // Start polling job status

        var jobListener = new dme.jobListener();
        jobListener.start(type, analysis);
        jobListener.on('status', function(self,analysis,msa) {

        if (analysis.status == globals.finished || analysis.status == globals.cancelled) {

          //The job has been completed in some way. Parse the results(if any)
          parseResults(analysis);
          mailer.send(analysis, msa);  

          //If mail is enabled. Mail the issue that the job is complete.
          if(analysis.sendmail != undefined && msa.mailaddr != undefined) {
            mailer.send(analysis, msa);  
          }
        }
      });
    });
  });

  // post the data
  postreq.write(analysisparams);
  postreq.end();
}

var parseResults = function (analysis) {

  //Open SQLite file and put them in mongodb
  //Open file sqlite file and populate mongodb
  Msa.findOne({_id : analysis.msafn}, function(err, msa) {
    var spool_path = globals.spooldir + msa.msaid + '.cache';
    var spooldb = new sqlite3.Database(spool_path);

    // For each analysis, find all subdocuments in the schema
    // Adapt each table.

    var table_query = "SELECT * FROM sqlite_master WHERE type='table'";

    spooldb.each(table_query, function(err, row) {

      if (row.name == "FILE_INFO" 
          || row.name == "SEQUENCES" 
          || row.name == "FILE_PARTITION_INFO") 
      {
        //do nothing
      }

      else {

        //Get schema
        var schema_name = row.name.camelCase('_');
        var Scheme = mongoose.model(schema_name);
        var lschema_name = schema_name.toLowerCase()
        
        //TODO: Fix FUBAR
        if(lschema_name in analysis && lschema_name.indexOf("fubarsiteinfo") == -1) {
          spooldb.each("SELECT * FROM " + row.name, function(err, row) {

            var params = {};

            Object.keys(row).forEach(function(col) {
              var new_column_name = col.toLowerCase();
              params[new_column_name] = row[col];
            });

            var table = new Scheme(params);

            table.save(function (err,result) {
              if (err) {
                console.log(err);
                return err;
              }

              try {
                analysis[lschema_name].push(table);
                analysis.save();
              } catch (err) { 
                console.log("No such schema : " + lschema_name);
              }

            });
          });
        }
      }
    });
  });
}

exports.parseResults = parseResults;

