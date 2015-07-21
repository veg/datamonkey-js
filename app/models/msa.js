/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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

var mongoose = require('mongoose'),
    moment = require('moment'),
    check = require('validator').check,
    globals = require('../../config/globals.js'),
    spawn = require('child_process').spawn,
    sanitize = require('validator').sanitize,
    fs = require('fs'),
    winston = require('winston'),
    seqio = require('../../lib/biohelpers/sequenceio.js'),
    logger = require('../../lib/logger');


var ident = {
    SUBTYPE: "subtype",
    DATE: "date",
    ID: "id",
    COUNTRY: "country",
    UNKNOWN: "unknown"
}

var error_codes = {
    INCORRECT_SPLIT: 0,
    FAILED_ASSIGNMENT: 1
}

function notEmptyValidator(val) {
    return val != null;
}

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PartitionInfo = new Schema({
    _creator: {
        type: Schema.Types.ObjectId,
        ref: 'Msa'
    },
    partition: Number,
    startcodon: Number,
    endcodon: Number,
    span: Number,
    usertree: String
});

var Sequences = new Schema({
    _creator: {
        type: Schema.Types.ObjectId,
        ref: 'Msa'
    },
    seqindex: Number,
    name: String
});

var Msa = new Schema({
    datatype: {
        type: Number,
        require: true
    },
    partition_info: [PartitionInfo],
    sequence_info: [Sequences],
    attribute_map: Object,
    partitions: Number,
    sites: Number,
    rawsites: Number,
    sequences: Number,
    gencodeid: Number,
    goodtree: Number,
    nj: String,
    usertree: String,
    visit_code: String,
    visit_date: Date,
    original_filename: String,
    mailaddr: String,
    created: {
        type: Date,
        default: Date.now
    }
});

Msa.virtual('genetic_code').get(function() {
    return globals.genetic_code[this.gencodeid];
});

Msa.virtual('day_created_on').get(function() {
    var time = moment(this.timestamp);
    return time.format('YYYY-MMM-DD');
});

Msa.virtual('time_created_on').get(function() {
    var time = moment(this.timestamp);
    return time.format('HH:mm');
});

/**
 * Filename of document's file upload
 */
Msa.virtual('filename').get(function() {
    return this._id;
});

/**
 * Complete file path for document's file upload
 */
Msa.virtual('filepath').get(function() {
    return __dirname + '/../../uploads/msa/' + this._id + '.fasta';
});

Msa.virtual('hyphy_friendly').get(function() {

    //Hyphy does not support arrays
    var hyphy_obj = {};
    var self = this;

    Object.keys(this._doc).forEach(function(key) {
        if (Array.isArray(self[key])) {
            hyphy_obj[key] = {};
            for (var i = 0; i < self[key].length; i++) {
                hyphy_obj[key][i] = self[key][i];
            }
        } else {
            if (key != "created") {
                hyphy_obj[key] = self[key];
            }
        }
    });

    //Remove attribute_map
    delete hyphy_obj['attribute_map'];

    return hyphy_obj;

});

var MsaModel = mongoose.model('MsaModel', Msa);

MsaModel.schema.path('mailaddr').validate(function(value) {
    if (value) {
        check(value).len(6, 64).isEmail();
    } else {
        return true;
    }
}, 'Invalid email');


Msa.methods.AnalysisCount = function(cb) {

    var type_counts = {};
    var c = 0;

    var count_increment = function(err, analysis) {

        c += 1;
        if (analysis != null) {
            type_counts[analysis.type] = analysis.id || 0;
        }

        if (c == Object.keys(globals.types).length) {
            cb(type_counts);
        }

    }

    //TODO: Change to get children
    for (var t in globals.types) {

        Analysis = mongoose.model(t.capitalize());
        //Get count of this analysis
        Analysis
            .findOne({
                upload_id: this._id
            })
            .sort('-id')
            .exec(count_increment)
    }

};

Msa.methods.aminoAcidTranslation = function(cb) {

    var self = this;

    // Split data sequences out
    var seq_array = seqio.parseFile(this.filepath, function(err, seq_array) {
        var translated_arr = seqio.translateSequenceArray(seq_array, self.gencodeid.toString());
        var translated_fasta = seqio.toFasta(translated_arr);
        cb(null, translated_fasta);
    });


};

Msa.methods.dataReader = function(file, cb) {
    if (file.indexOf('fastq') != -1) {

        // TODO: Support FASTQ 
        var result = {};
        result.FILE_INFO = {};
        result.FILE_PARTITION_INFO = {};
        result.SEQUENCES = [];

        result.FILE_INFO.partitions = -1;
        result.FILE_INFO.gencodeid = -1;
        result.FILE_INFO.sites = -1;
        result.FILE_INFO.sequences = -1;
        result.FILE_INFO.timestamp = -1;
        result.FILE_INFO.goodtree = 0;
        result.FILE_INFO.nj = '';
        result.FILE_PARTITION_INFO.usertree = '';
        result.FILE_INFO.rawsites = -1;
        cb('', result);

        return;
    }

    var hyphy_process = globals.hyphy + ' ' + __dirname + "/../../lib/bfs/datareader.bf";
    winston.info(globals.hyphy + ' ' + __dirname + '/../../lib/bfs/datareader.bf' + ' : ' + 'spawning process');

    var hyphy = spawn(globals.hyphy, [__dirname + "/../../lib/bfs/datareader.bf"]);

    var result = '';

    hyphy.stdout.on('data', function(data) {
        result += data.toString();
    });

    hyphy.stdout.on('close', function(code) {

        try {
            results = JSON.parse(result);
        } catch (e) {
            cb("An unexpected error occured when parsing the sequence alignment! Here is the full traceback : " + result, {});
        }

        if (results != undefined) {
            if ("error" in results) {
                cb(results.error, '');
            } else {
                cb('', results);
            }
        }

    });


    hyphy.stdin.write(file + "\n");
    winston.info(hyphy_process + ' : ' + 'file : ' + file)
    hyphy.stdin.write(this.gencodeid.toString());
    winston.info(hyphy_process + ' : ' + 'gencodeid : ' + this.gencodeid)

    hyphy.stdin.end();

};



/**
 * Ensure that the file is in valid FASTA format
 * @param fn {String} path to file to be validated
 */
Msa.statics.validateFasta = function(fn, cb, options) {
    seqio.parseFile(fn, function(err, result) {

        if (err) {
            cb(err, result)
            return;
        }

        if (result.length <= 1) {
            cb({
                'msg': '1 sequences or fewer found'
            }, false)
            return;
        }

        // Check that all sequences are the same length

        if (options && options['no-equal-length']) {

        } else {
            var reference_length = result[0].seq.length
            var all_the_same = result.every(function(d) {
                return d.seq.length == reference_length
            });

            if (!all_the_same) {
                cb({
                    'msg': 'Sequence lengths do not all match'
                }, false)
            }
        }

        cb('', true)

    }, options);

}

Msa.statics.parseFile = function(fn, datatype, gencodeid, cb) {

    var msa = new this;

    msa.datatype = datatype;
    msa.gencodeid = gencodeid;

    msa.dataReader(fn, function(err, result) {

        if (err) {
            logger.error(err);
            cb(err, null)
            return;
        }

        var fpi = result.FILE_PARTITION_INFO;
        var file_info = result.FILE_INFO;
        msa.partitions = file_info.partitions;
        msa.gencodeid = file_info.gencodeid;
        msa.sites = file_info.sites;
        msa.sequences = file_info.sequences;
        msa.timestamp = file_info.timestamp;
        msa.goodtree = file_info.goodtree;
        msa.nj = file_info.nj;
        msa.usertree = fpi.usertree;
        msa.rawsites = file_info.rawsites;
        var sequences = result.SEQUENCES;
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

Msa.statics.scrubUserTree = function(fn, cb) {

    // Match newick tree

    fs.readFile(fn, function(err, data) {
        if (err) {
            cb(err);
        }

        // Split data sequences out
        var seq_array = seqio.parseFile(data.toString());
        var translated_arr = seqio.translateSequenceArray(seq_array, self.gencodeid.toString());
        var translated_fasta = seqio.toFasta(translated_arr);

        cb(null, translated_fasta);

    });

}



exports = {
    MsaSchema: Msa,
    Msa: mongoose.model('Msa', Msa),
    PartitionInfo: mongoose.model('PartitionInfo', PartitionInfo),
    Sequences: mongoose.model('Sequences', Sequences)
}

module.exports = exports;