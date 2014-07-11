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


var error   = require( ROOT_PATH + '/lib/error.js'),
    helpers = require(ROOT_PATH + '/lib/helpers.js'),
    globals = require(ROOT_PATH + '/config/globals.js'),
    fs      = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Sequences =  mongoose.model('Sequences'),
    PartitionInfo =  mongoose.model('PartitionInfo');


// app.get('/msa', msa.showUploadForm);
exports.showUploadForm = function (req, res) {
  res.render('msa/form.ejs');
};

/**
 * Form submission page
 * app.post('/msa/uploadfile', msa.uploadFile);
 */
exports.uploadFile = function (req, res) {
  // Validate that the file uploaded was a FASTA file
  var msa = new Msa;
  msa.save(function (err, msa) {
    fs.rename(req.files.files.path, msa.filepath, function(err, result) {
      if(err) {
        // FASTA validation failed, report an error and the form back to the user
        res.json(200, {'error': { 'file' : err.msg }});
      } else {
        msa.save(function (err, result) {
          res.json(200, {'result': msa});
        });
      }
    });
  });
}

/**
 * An AJAX request that verifies the upload is correct
 * app.post('/msa/upload/:id', msa.verifySubmit);
 */
exports.verifySubmit = function (req, res) {

  var postdata = req.body;
  var id = req.params.id;

  Msa.findOne({_id: id}, function (err, sequence_alignment) {
    sequence_alignment.datatype  = postdata.datatype;
    sequence_alignment.gencodeid = postdata.gencodeid;
    sequence_alignment.mailaddr  = postdata.mailaddr;

    sequence_alignment.dataReader(sequence_alignment.filepath, function(result) {

      if ('error' in result) {
        res.format({
          json: function(){
            res.json(200, {'msg': result.error });
          }
        });

      } else {

        var fpi = result.FILE_PARTITION_INFO;
        var file_info = result.FILE_INFO;

        sequence_alignment.partitions = file_info.partitions;
        sequence_alignment.gencodeid  = file_info.gencodeid;
        sequence_alignment.sites      = file_info.sites;
        sequence_alignment.sequences  = file_info.sequences;
        sequence_alignment.timestamp  = file_info.timestamp;
        sequence_alignment.goodtree   = file_info.goodtree;
        sequence_alignment.nj         = file_info.nj;
        sequence_alignment.rawsites   = file_info.rawsites;

        var sequences = result.SEQUENCES;
        sequence_alignment.sequence_info = [];
        for (i in sequences) {
          var sequences_i = new Sequences(sequences[i]);
          sequence_alignment.sequence_info.push(sequences_i);
        }

        //Ensure that all information is there
        var partition_info = new PartitionInfo(fpi);
        sequence_alignment.partition_info = partition_info;
        sequence_alignment.save(function(err, result) {
          if(err) {
            res.format({
              json: function() {
                res.json(200, err);
              }
            });
          } else {
              // Validate that the file uploaded was a FASTA file
              Msa.createAttributeMap(result.filepath, function(err, result) {
                parsed_attributes = Msa.parseHeaderFromMap(result.headers[0], result);
                res.format({
                  html: function() {
                    res.render('msa/attribute_map_assignment.ejs', { 
                                                                      'map'           : result, 
                                                                      'example_parse' : parsed_attributes, 
                                                                      'msa_id'        : sequence_alignment._id,
                                                                      'error'         : err
                                                                   });
                  },
                  json: function(){
                    res.json(200, { 'map'           : result, 
                                    'example_parse' : parsed_attributes, 
                                    'msa_id'        : sequence_alignment._id, 
                                    'error'         : err
                                    });
                  }
                });
              });
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

  Msa.findOne({_id : id}, function (err, item) {

    if (err || !item) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else {

      var details = item;

      //Get the count of the different analyses on the job
      if(req.query.format == 'hyphy') {
        // Reformat arrays
        res.json(200, item.hyphy_friendly);

      } else {

        res.format({

          json: function() {
            res.json(200, item);
          },

          html: function() {
            res.render('msa/summary.ejs', { 'details' : details });
          }

        });
      }
    }
  });
};

// app.get('/msa/:id', msa.findById);
exports.getNeighborJoin = function (req, res) {

  //We must get count of all analyses for the job, respective of type.
  var id = req.params.id;

  Msa.findOne({_id : id}, 'nj', function (err, item) {
    if (err || !item) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else if (!item.nj) {
      // check if tree is null
    } else {
      //Get the count of the different analyses on the job
      res.json(200, item);
    }
  });

};

// app.put('/msa/:id', msa.updateMsa);
exports.updateMsa = function(req, res) {
  var id = req.query.id;
  var postdata = req.query;
  var options = { multi: false };

  Msa.findOne({_id: id}, function (err, item) {
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
  Msa.findOneAndRemove({ _id: id }, function(err) {
    if (err) {
      res.json(500, error.errorResponse(err));
    } else {
      res.json({"success" : 1});
     }
  });
}

// app.get('/msa/:id/aa', msa.aminoAcidTranslation);
exports.aminoAcidTranslation = function(req, res) {
  var id = req.params.id;
  Msa.findOne({ _id: id }, function(err, item) {
    if (err) {
      res.json(500, error.errorResponse(err));
    } else {
      item.aminoAcidTranslation(function(err, aa) {

        res.set({
          'Content-Type': 'application/octet-stream'
        })

        res.set({'Content-Disposition':'attachment; filename="' + id + '_aa.fasta"'});

        res.send(aa);

      });
    }
  });
}

// app.get('/msa/:id/aa/view', msa.aminoAcidTranslation);
exports.aminoAcidTranslationViewer = function(req, res) {
  var id = req.params.id;
  Msa.findOne({ _id: id }, function(err, item) {
    if (err) {
      res.json(500, error.errorResponse(err));
    } else {
      item.aminoAcidTranslation(function(err, aa) {
        res.format({
          html: function() {
                res.render('msa/alignmentview.ejs', {'sequence' : aa});
          }
        });
      });
    }
  });
}


/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/attributes', hivtrace.results);
 */
exports.attributemap = function (req, res) {
  var id = req.params.id;

  Msa.findOne({_id: id}, 'attribute_map', function (err, msa) {

    if (err || !hivtrace) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.json({msa : msa});
    }

  });

}
