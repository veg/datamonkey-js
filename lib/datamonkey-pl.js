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

var sqlite3     = require('sqlite3'),
    querystring = require('querystring'),
    http        = require('http'),
    fs          = require('fs');

var globals     = require(ROOT_PATH + '/config/globals.js'),
    mailer      = require(ROOT_PATH + '/lib/mailer.js'),
    dme         = require(ROOT_PATH + '/lib/datamonkey-event.js'),
    error       = require(ROOT_PATH + '/lib/error.js'),
    helpers     = require(ROOT_PATH + '/lib/helpers.js');

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

// Upload file to perl
exports.uploadToPerl = function (upload_file, response_callback) {

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
        helpers.logger.error("Could not find Job ID: " + str);
        response_callback(err, null);
        return;
      }

      var spool_path = SPOOL_DIR + fn + '.cache',
        spooldb = new sqlite3.Database(spool_path);

      spooldb.get("SELECT * FROM FILE_INFO", function (err, row) {
        upload_file.upload_id  = fn;
        upload_file.partitions = row.Partitions;
        upload_file.sites      = row.Sites;
        upload_file.rawsites   = row.RawSites;
        upload_file.sequences  = row.Sequences;
        upload_file.goodtree   = row.GoodTree;
        upload_file.nj         = row.NJ;
        response_callback(null, upload_file);
      });
    });

  }

  // Boundary: "--" + up to 70 ASCII chars + "\r\n"
  var boundary = '---------------------------10102754414578508781458777923';
  var multipartBody = composeMultipartBody(boundary, upload_file);

  var headers = {
    'Accept-Encoding' : 'gzip,deflate',
    'Content-Type'    : 'multipart/form-data; boundary=' + boundary,
    'Content-Length'  : multipartBody.length
  }

  //The url we want is `www.datamonkey.org/`
  var options = {
    host          : HOST,
    path          : '/cgi-bin/datamonkey/upload.pl',
    headers       : headers,
    method        : 'POST'
  };

  //This is the data we are posting, it needs to be a string or a buffer
  var req = http.request(options, callback);
  req.write(multipartBody);
  req.end();

}

// Dispatch analysis to perl datamonkey
exports.dispatchAnalysis = function (analysis, type, msaf, params, callback) {

  var Analysis = mongoose.model(type.capitalize());

  // Look up UploadFile information
  // Build the post string from an object
  // Need to ensure that we have all of these variables
  var analysisparams = querystring.stringify({
    'filename'              : msaf.upload_id,
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
      host               : HOST,
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

    result.on('data', function (chunk) {
      str = str + chunk;
    });

    result.on('end', function () {
      callback(null, analysis);

      // This job has been successfully submitted.
      // Spawn the event listener for updating the status
      // Start polling job status

      var jobListener = new dme.jobListener();
      jobListener.start(type, analysis);
      jobListener.on('status', function(self,analysis,msa) {
        if (analysis.status == globals.finished 
            || analysis.status == globals.cancelled) {

          //The job has been completed in some way. Parse the results(if any)
          parseResults(analysis, function(result) {
            mailer.send(result, msa);  
          });

          //If mail is enabled. Mail the issuer that the job is complete.
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

// Import Sqlite to mongodb
function importSqlite(tn, analysis, spooldb, callback) {

  //Get schema
  var schema_name = tn.name.camelCase('_');
  var Scheme = mongoose.model(schema_name);
  var lschema_name = schema_name.toLowerCase()
  
  //TODO: Fix FUBAR
  if(lschema_name in analysis && lschema_name.indexOf("fubarsiteinfo") == -1) {
    spooldb.all("SELECT * FROM " + tn.name, function(err, rows) {
      var count = rows.length;
      for(var i in rows) {
        var row = rows[i];

        var params = {};
        Object.keys(row).forEach(function(col) {
          var new_column_name = col.toLowerCase();
          params[new_column_name] = row[col];
        });

        var table = new Scheme(params);

        table.save(function (err,result) {
          if (err) {
            helpers.logger.error(err);
          }

          try {
            analysis[lschema_name].push(result);
            analysis.save(function(err,result) {
              count--;
              if(count <= 0) {
                callback(tn.name);
              }
            });
          } catch (err) { 
            helpers.logger.error("No such schema : " + lschema_name);
          }
        });
      }
    });
  }
}

// Parse sqlite results to mongodb
var parseResults = function (analysis, callback) {

  if(!callback) {
    return false;
  }
  
  if ( !analysis.upload_id ) {
    helpers.logger.error("Invalid analysis passed");
    callback(false);
  }

  //Open SQLite file and put them in mongodb
  //Open file sqlite file and populate mongodb
  Msa.findOne({_id : analysis.upload_id}, function(err, msa) {

    if (err) {
      helpers.logger.error("Could not find upload file id");
    }

    if (msa.length == 0) {
      helpers.logger.error("Could not find upload file id");
    }

    var spool_path = SPOOL_DIR + msa.upload_id + '.cache';

    if (!fs.existsSync(spool_path)) {
      helpers.logger.error("spool path: " + spool_path + " does not exist!");
      callback(false);
    }

    var spooldb = new sqlite3.Database(spool_path);

    // For each analysis, find all subdocuments in the schema
    // Adapt each table.
    var table_query = "SELECT * FROM sqlite_master WHERE type='table'";

    spooldb.all(table_query, function(err, rows) {
      for(var i in rows) {
        var row = rows[i];
        if (err) {
          helpers.logger.error(err);
        }

        if (row.name == "FILE_INFO" 
            || row.name == "SEQUENCES" 
            || row.name == "FILE_PARTITION_INFO") 
        {
          //do nothing
          if(i == rows - 1 ) {
            callback(analysis); 
          }
        }

        else {
          importSqlite(row, analysis, spooldb,function(name){
            if(name == (rows[rows.length - 1].name) ) {
              callback(analysis); 
            }
          });
        }
      }
    });
  });
}

exports.parseResults = parseResults;
