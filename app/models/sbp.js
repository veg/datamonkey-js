/*

  HyPhy - Hypothesis Testing Using Phylogenies.

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


require(__dirname + '/slac');
require(__dirname + '/gard');

var mongoose = require('mongoose')
  , SlacModel = mongoose.model('SlacModel')
  , GardSplits = mongoose.model('GardSplits')
  , GardSummary = mongoose.model('GardSummary')
  , GardDetails = mongoose.model('GardDetails');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Mixed = mongoose.Schema.Types.Mixed;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var Sbp = new Schema({
  msafn        : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status       : String,
  sendmail     : Boolean,
  parameters   : [SbpParameters],
  summary      : [SbpSummary],
  trees        : [SbpTrees],
  slac_model   : [SlacModel],
  gard_splits  : [GardSplits],
  gard_summary : [GardSummary],
  gard_details : [GardDetails],
});

var SbpParameters = new Schema({
  ratematrix  : Mixed,  //Protein
  frequencies : Number, //Protein
  rateoption  : Number,
  rateclasses : Number,
  modelstring : String  //Non-protein
});

var SbpTrees = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Sbp' },
  site        : Number,
  tree1       : String,
  tree2       : String,
  tree1length : Number,
  tree2length : Number,
  aic         : Number,
  caic        : Number,
  bic         : Number,
  waic        : Number,
  wcaic       : Number,
  wbic        : Number,
  splitsmatch : Number,
  rf          : Number
});

var SbpSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Sbp' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Sbp', Sbp);
module.exports = mongoose.model('SbpParameters', SbpParameters);
module.exports = mongoose.model('SbpTrees', SbpTrees);
module.exports = mongoose.model('SbpSummary', SbpSummary);

