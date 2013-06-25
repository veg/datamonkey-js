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


var dpl   = require( ROOT_PATH + '/lib/datamonkey-pl.js');
var error = require( ROOT_PATH + '/lib/error.js');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa');

//find sequence by id
exports.findById = function (req, res) {
  var id = req.params.id;
  Msa.findOne({msaid : id}, function (err, items) {
    if (err || !items) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else {
      res.json(items);
    }
  });
};

//return all sequences
exports.findAll = function (req, res) {

  Msa.find({}, function (err, items) {

    if (err) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else {
     res.json(items);
    }

  });

};

//upload a sequence
exports.uploadMsa = function (req, res) {

  postdata = req.query;

  try {
    postdata.contents = req.body["files"][1];
  } catch(e) {
   res.json(500, error.errorResponse("Missing Parameters: No File"));
   return;
  }

  var sequence_alignment = new Msa;

  try {

    sequence_alignment.contents  = postdata.contents;
    sequence_alignment.datatype  = postdata.datatype;
    sequence_alignment.gencodeid = postdata.gencodeid;
    sequence_alignment.mailaddr  = postdata.mailaddr;

  } catch(e) {

    res.json(500, error.errorResponse("Missing Parameters: " + e));
    return;

  }

  //Upload to Perl to get all other information
  dpl.uploadToPerl(sequence_alignment, function(err, upload_file) {
    upload_file.save(function (err, result) {
      if (err) {
        res.json(500, error.errorResponse(err));
      } else {
        res.json(200, upload_file.clipped);
      }
    });
  });

}

//update a sequence
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

//delete a sequence
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

