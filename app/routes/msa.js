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


var dpl     = require( ROOT_PATH + '/lib/datamonkey-pl.js'),
    error   = require( ROOT_PATH + '/lib/error.js'),
    helpers = require(ROOT_PATH + '/lib/helpers.js'),
    globals = require(ROOT_PATH + '/config/globals.js'),
    fs      = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa');



// app.get('/msa', msa.showUploadForm);
exports.showUploadForm = function (req, res) {
  res.render('upload/form.ejs');
};

// app.post('/msa', msa.uploadMsa);
exports.uploadMsa = function (req, res) {

  postdata = req.body;

  try {
    contents = fs.readFileSync(req.files.files.path);
    postdata.contents = contents;
  } catch(e) {
    res.format({
      html: function(){
        res.render('error.ejs', error.errorResponse("Missing Parameters: No File"));
      },
      json: function(){
        res.json(500, error.errorResponse("Missing Parameters: No File"));
      }
    });
   return;
  }

  var sequence_alignment = new Msa;

  try {

    sequence_alignment.contents  = postdata.contents;
    sequence_alignment.datatype  = postdata.datatype;
    sequence_alignment.gencodeid = postdata.gencodeid;
    sequence_alignment.mailaddr  = postdata.mailaddr;

  } catch(e) {
    res.format({
      html: function(){
        res.render('error.ejs', error.errorResponse("Missing Parameters: " + e));
      },
      json: function(){
        res.json(500, error.errorResponse("Missing Parameters: " + e));
      }
    });

    return;
  }

  //Upload to Perl to get all other information
  dpl.uploadToPerl(sequence_alignment, function(err, upload_file) {
    if(err) {
      helpers.logger.error("Error uploading file: " + err);
      res.json(500, error.errorResponse(err));
    }

    if(!upload_file) {
      err = "Unexpected error occured: Empty sequence alignment";
      helpers.logger.error(err);
      res.json(500, error.errorResponse(err));
    }


    //TODO: We should just redirect
    upload_file.save(function (err, result) {
      if (err) {
        res.json(500, error.errorResponse(err));
      } else {
        res.format({
          html: function(){
            res.redirect('./' + upload_file.msaid);
          },
          json: function(){
            res.json(200, details);
          }
        });
      }
    });
  });
}

// app.get('/msa/:id', msa.findById);
exports.findById = function (req, res) {

  //We must get count of all analyses for the job, respective of type.
  var id = req.params.id;

  Msa.findOne({msaid : id}, function (err, items) {
    if (err || !items) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else {
      var details = items;

      //Get the count of the different analyses on the job
      items.AnalysisCount(function(type_counts) {

        var ftc = []

        for(var t in globals.types) {
          ftc[t] = {
            "full_name" : globals.types[t].full_name,
            "count"     : type_counts[t] || 0,
          }
        }

        res.format({
          html: function(){
            res.render('upload/summary.ejs', {'details': details, 'type_count': ftc });
          },
          json: function(){
            res.json(200, {'details': details, 'type_count': ftc });
          }
        });
      });
    }
  });
};

// app.put('/msa/:id', msa.updateMsa);
exports.updateMsa = function(req, res) {

  var id = req.query.id;
  var postdata = req.query;
  var options = { multi: false };

  Msa.findOne({msaid : id}, function (err, item) {
    if (err) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else {
      //Should check the postdata before
      Msa.findByIdAndUpdate(item._id, postdata, options, function (err, result) {
        if (err) {
          res.json(500, error.errorResponse(err));
        } else {
          res.json(result);
        }
      });
    }
  });
}

// app.delete('/msa/:id', msa.deleteMsa);
exports.deleteMsa = function(req, res) {

  var id = req.params.id;

  Msa.findOneAndRemove({ msaid: id }, function(err) {
    if (err) {
      res.json(500, error.errorResponse(err));
    } else {
      res.json({"success" : 1});
     }
  });
}

