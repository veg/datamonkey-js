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

var mongoose    = require('mongoose'),
    moment      = require('moment'),
    check       = require('validator').check,
    globals     = require('../../config/globals.js'),
    spawn       = require('child_process').spawn,
    sanitize    = require('validator').sanitize,
    fs          = require('fs'),
    seqio       = require( '../../lib/biohelpers/sequenceio.js'),
    country_codes = require( '../../config/country_codes.json'),
    subtypes      = require( '../../config/subtypes.json'),
    logger        = require('../../lib/logger');


var ident = {
    SUBTYPE : "subtype",
    DATE    : "date",
    ID      : "id",
    COUNTRY : "country",
    UNKNOWN : "unknown"
}

var error_codes = {
    INCORRECT_SPLIT   : 0,
    FAILED_ASSIGNMENT : 1
}

function notEmptyValidator (val) {
  return val != null;
}

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var PartitionInfo = new Schema({
    _creator   : { type : Schema.Types.ObjectId, ref : 'Msa' },
    partition  : Number,
    startcodon : Number,
    endcodon   : Number,
    span       : Number,
    usertree   : String
});

var Sequences = new Schema({
    _creator : { type : Schema.Types.ObjectId, ref : 'Msa' },
    seqindex : Number,
    name     : String
});


var Msa = new Schema({
    datatype       : {type : Number, require : true},
    partition_info : [PartitionInfo],
    sequence_info  : [Sequences],
    attribute_map  : Object,
    partitions     : Number,
    sites          : Number,
    rawsites       : Number,
    sequences      : Number,
    gencodeid      : Number,
    goodtree       : Number,
    nj             : String,
    mailaddr       : String,
    created        : {type : Date, default : Date.now}
});

Msa.virtual('genetic_code').get(function () {
    return globals.genetic_code[this.gencodeid];
});

Msa.virtual('day_created_on').get(function () {
    var time = moment(this.timestamp);
    return time.format('YYYY-MMM-DD');
});

Msa.virtual('time_created_on').get(function () {
    var time = moment(this.timestamp);
    return time.format('HH:mm');
});

/**
 * Filename of document's file upload
 */
Msa.virtual('filename').get(function () {
  return this._id;
});

/**
 * Complete file path for document's file upload
 */
Msa.virtual('filepath').get(function () {
  return __dirname + '/../../uploads/msa/' + this._id + '.fasta';
});

Msa.virtual('hyphy_friendly').get(function () {

  //Hyphy does not support arrays
  var hyphy_obj = {};
  var self = this;

  Object.keys(this._doc).forEach(function(key) {
    if(Array.isArray(self[key])) {
        hyphy_obj[key] = {};
     for(var i = 0; i < self[key].length; i++) {
        hyphy_obj[key][i] = self[key][i];
     }
    } else {
      if(key != "created") {
        hyphy_obj[key] = self[key];
      }
    }
  });

  //Remove attribute_map
  delete hyphy_obj['attribute_map'];  

  return hyphy_obj;

});

var MsaModel = mongoose.model('MsaModel', Msa);

MsaModel.schema.path('mailaddr').validate(function (value) {
  if(value) {
  check(value).len(6, 64).isEmail();
  } else {
    return true;
  }
}, 'Invalid email');

Msa.methods.AnalysisCount = function (cb) {

  var type_counts = {};
  var c = 0;

  var count_increment = function(err, analysis) {

    c += 1;
    if(analysis != null) {
      type_counts[analysis.type] = analysis.id || 0; 
    }

    if(c == Object.keys(globals.types).length) {
      cb(type_counts);
    }

  }

  //TODO: Change to get children
  for(var t in globals.types) {

    Analysis = mongoose.model(t.capitalize());
    //Get count of this analysis
    Analysis 
    .findOne({ upload_id: this._id })
    .sort('-id')
    .exec(count_increment)
  }

};

Msa.methods.aminoAcidTranslation = function (cb) {
  var self = this;

  fs.readFile(this.filepath, function (err, data) {
    if (err) {
      cb(err);
    }

    // Split data sequences out
    var seq_array = seqio.parseFile(data.toString());
    var translated_arr = seqio.translateSequenceArray(seq_array, self.gencodeid.toString());
    var translated_fasta = seqio.toFasta(translated_arr);

    cb(null, translated_fasta);

  });

};

Msa.methods.dataReader = function (file, cb) {

  var hyphy =  spawn(globals.hyphy,
                    [__dirname + "/../../lib/bfs/datareader.bf"]);


  var result = '';

  hyphy.stdout.on('data', function (data) {
    result += data.toString();
  });

  hyphy.stdout.on('close', function (code) {

    try {
      results = JSON.parse(result);
    } catch(e) {
      cb("An unexpected error occured when parsing the sequence alignment! Here is the full traceback : " + result, {});
    }

    if(results != undefined) {
      if ("error" in results) {
        cb(results.error, '');
      } else {
        cb('', results);
      }
    }

  });


  hyphy.stdin.write(file + "\n");

  if(this.datatype == 1) {
    hyphy.stdin.write("-1\n");
  } else {
    hyphy.stdin.write(this.datatype.toString());
  }

  hyphy.stdin.end();

};

function isSubtype(supposed_subtype) {
  return subtypes.subtypes.indexOf(supposed_subtype) != -1;
}

function isDate(supposed_date) {

  // check for sampling year/date
  var valid_date_formats = [
                        "MM-DD-YYYY",
                        "DD-YY",
                        "DD-MM-YYYY",
                        "YYYY",
                        "YYYYMMDD"
                        ];

  var parsed_date = moment(supposed_date, valid_date_formats, true);
  if(parsed_date.isValid()) {
    return parsed_date.isBefore(moment());
  } else {
    return false;
  }

}

function isCountry(supposed_country) {
  return Object.keys(country_codes).indexOf(supposed_country) != -1
}

/**
 * Create an attribute map based off the header files of
 * a FASTA file
 */
//Msa.statics.createAttributeMap = function (fn, cb) {
Msa.methods.createAttributeMap = function (cb) {

  // SDHC|AEH020|222-4kr|20090619
  // Z|JP|K03455|2036|6 
  var testForAttributes = function (id) {

    var attr_map = {};
    var possible_delimiters = ['_', '|','.',',',';','\t',':'];

    for(var i in possible_delimiters) {
      cur_dl = possible_delimiters[i];
      attr_map[cur_dl] = [];

      var arr = id.split(possible_delimiters[i]);

      for (var j in arr) {

        // Find subtype
        if (isSubtype(arr[j])) {
          attr_map[cur_dl][j] = ident.SUBTYPE;
        }

        // check if sampling country
        else if (isCountry(arr[j])) {
          attr_map[cur_dl][j] = ident.COUNTRY;
        }

        else if (isDate(arr[j])) {
          attr_map[cur_dl][j] = ident.DATE;
        }

        else {
          attr_map[cur_dl][j] = ident.UNKNOWN;
        }

      }

      // If there is only one null attribute, we can guess that it's the id
      var c = 0;
      var index = -1;
      for(var j = 0; j < attr_map[cur_dl].length; j++) {
        if(attr_map[cur_dl][j] == ident.UNKNOWN) {
          c++;
          index = j;
        }
      }
      if (c == 1) {
       attr_map[cur_dl][index] = "id";
      }
    }

    return attr_map;

  }

  var validateAttrMap = function (id, delimiter, attr_map) {

    header = id.split(delimiter);

    for(var i=0; i < attr_map.length; i++) {
      if(attr_map[i] == ident.SUBTYPE) {
        if (!isSubtype(header[i])) {
          attr_map[i] = 'maybe_' + ident.SUBTYPE;
          return false;
        } 
      //Checking if a date is too expensive
      } else if (attr_map[i] == ident.DATE) {
        if (!isDate(header[i])) {
          attr_map[i] = 'maybe_' + ident.DATE;
          return false;
        } 
      } else if (attr_map[i] == ident.COUNTRY) {
        if (!isCountry(header[i])) {
          attr_map[i] = 'maybe_' + ident.COUNTRY;
          return false;
        } 
      }
    }
    return true;
  }

  var checkForConsistency = function (headers, delimiter, attr_map) {

    // Ensure all headers are the same length
    lengths = {};

    //Sort by file lengths
    headers.map( function(x) { lengths[x.split(delimiter).length] = lengths[x.split(delimiter).length] + 1 || 1});

    if(Object.keys(lengths).length > 1) {
      // Sort and return problematic headers
      var max   = 0;
      var index = 0;
      for(var j in lengths) {
        if(lengths[j] > max) {
          max = lengths[j]; 
          index = j;
        }
      }

      var failed_headers = headers.filter(function(x) { return x.split(delimiter).length != index} );
      return { 'status': false,
               'info'  : {
                 'type': 'parse_fail', 
                 'code': error_codes.INCORRECT_SPLIT, 
                 'msg': 'Based on a delimiter of "' + delimiter + '", you have inconsistent formatting. The following headers either have too little or too many fields. Please revise your FASTA file and resubmit once reconciled. Alternatively, you can skip attributes altogether and continue.', 
                 'failed_headers': failed_headers
                }
              };
    }


    // If more than one, return a problem with the problem headers
    //Change attribute map to maybe_ if some fail
    headers.map(function(x) { validateAttrMap(x, delimiter, attr_map) } );

    //var failed_headers = headers.filter(function(x) { return !validateAttrMap(x, delimiter, attr_map)} );
    //if(failed_headers.length > 0) {
    //  return { 'status': false,
    //           'info'  : {
    //             'type': 'parse_fail', 
    //             'code': error_codes.FAILED_ASSIGNMENT, 
    //             'msg': 'Some headers failed parsing', 
    //             'failed_headers': failed_headers
    //            }
    //          };
    //}

    return {'status': true}

  }

  // Reading a file is no longer necessary
  // Use sequence info
  var err = false;

  var headers = this.sequence_info.map(function(d) { return d.name }) 

  // Try exploding and testing for attributes
  var attr_map = testForAttributes(headers[0]);

  var max   = -4;
  var index = -4;
  for (c in attr_map) {
      if(attr_map[c].length > max) {
        max = attr_map[c].length;
        index = c;
      }
  }

  var is_consistent = checkForConsistency(headers, index, attr_map[index]);
  if(is_consistent.status != true) {
    err = is_consistent.info;
  }

  cb(err, {"headers": headers, "map" : attr_map[index], "delimiter": index});


}

Msa.statics.parseHeaderFromMap = function (header, attr_map) {
  parsed = {};
  var arr = header.split(attr_map.delimiter);
  for(var i in arr) {
    if(!parsed[attr_map.map[i]]) {
      parsed[attr_map.map[i]] = arr[i];
    } else {
      var c = 1;
      var new_key = attr_map.map[i] + c;

      while(parsed[new_key]) {
        new_key = attr_map.map[i] + ++c;
      }

      parsed[new_key] = arr[i];

    }
  }
  return parsed;
}

/**
 * Ensure that the file is in valid FASTA format
 * The function relies on "FastaValidator" from 
 * git@github.com:veg/TN93.git to be installed and defined in setup
 * @param fn {String} path to file to be validated
 */
Msa.statics.validateFasta = function (fn, cb) {
  var fasta_validator =  spawn(globals.fasta_validator, 
                               [fn]); 

  fasta_validator.stderr.on('data', function (data) {
    // Failed return the error
    cb({success: false, msg: String(data).replace(/(\r\n|\n|\r)/gm,"")});
  }); 

  fasta_validator.on('close', function (code) {
    // Check the error code, but probably success!
    if(code != 1) {
      cb({success: true});
    }
  }); 
}

Msa.statics.validateFasta = function (fn, cb) {
  var fasta_validator =  spawn(globals.fasta_validator, 
                               [fn]); 

  fasta_validator.stderr.on('data', function (data) {
    // Failed return the error
    cb({success: false, msg: String(data).replace(/(\r\n|\n|\r)/gm,"")});
  }); 

  fasta_validator.on('close', function (code) {
    // Check the error code, but probably success!
    if(code != 1) {
      cb({success: true});
    }
  }); 
}

Msa.statics.parseFile = function(fn, datatype, gencodeid, cb) {

  var msa = new this;

  msa.datatype  = datatype;
  msa.gencodeid = gencodeid;

  msa.dataReader(fn, function(err, result) {

    if(err) {
      logger.error(err);
      cb(err, null)
      return;
    }

    var fpi        = result.FILE_PARTITION_INFO;
    var file_info  = result.FILE_INFO;
    msa.partitions = file_info.partitions;
    msa.gencodeid  = file_info.gencodeid;
    msa.sites      = file_info.sites;
    msa.sequences  = file_info.sequences;
    msa.timestamp  = file_info.timestamp;
    msa.goodtree   = file_info.goodtree;
    msa.nj         = file_info.nj;
    msa.rawsites   = file_info.rawsites;
    var sequences  = result.SEQUENCES;
    msa.sequence_info = [];

    var Sequences = mongoose.model('Sequences', Sequences);
    for (i in sequences) {
      var sequences_i = new Sequences(sequences[i]);
      msa.sequence_info.push(sequences_i);
    }

    //Ensure that all information is there
    var PartitionInfo = mongoose.model('PartitionInfo', PartitionInfo);
    var partition_info = new PartitionInfo(fpi);
    msa.partition_info = partition_info;
    cb(null, msa)

  });

}

module.exports = mongoose.model('Msa', Msa);
module.exports = mongoose.model('PartitionInfo', PartitionInfo);
module.exports = mongoose.model('Sequences', Sequences);

