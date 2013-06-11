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


//Also needs to include status, and results
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');

var AnalysisSchema = require(__dirname + '/analysis');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Cms = AnalysisSchema.extend({
  parameters            : [CmsParameters],
  cmssummary            : [CmsSummary],
  cmsbyresidue          : [CmsByresidue],
  rateclassbics         : [Rateclassbics],
  crediblemodelssummary : [CrediblemodelsSummary],
  crediblemodelsrates   : [CrediblemodelsRates]
});

var CmsParameters = new Schema({
  modelstring : String,
  treemode    : Number
});

var CmsSummary = new Schema({
  col_value : String,
  col_key : String
});

var CmsByresidue = new Schema({
  residue_idx1 : Number,
  residue_idx2 : Number,
  stanfelchng  : Number,
  polaritychng : Number,
  chargechng   : Number,
  chemcomp     : Number,
  polarity     : Number,
  volume       : Number,
  isoelec      : Number,
  hydrop       : Number,
  class        : Number,
  best_rate    : Number,
  ma_rate      : Number,
  clustersupp  : Number,
});

var Rateclassbics  = new Schema({ 
  num_rates : Number,
  bic       : Number
});

var CrediblemodelsSummary = new Schema({
  model_idx : Number,
  loglike   : Number,
  parms     : Number,
  bic       : Number,
  num_rates : Number
});

var CrediblemodelsRates = new Schema({
  model_idx    : Number,
  residue_idx1 : Number,
  residue_idx2 : Number,
  subs_rate    : Number
})

module.exports = mongoose.model('Cms', Cms);
module.exports = mongoose.model('CmsParameters', CmsParameters);
module.exports = mongoose.model('Rateclassbics', Rateclassbics);
module.exports = mongoose.model('CmsSummary', CmsSummary);
module.exports = mongoose.model('CrediblemodelsSummary', CrediblemodelsSummary);
module.exports = mongoose.model('CrediblemodelsRates', CrediblemodelsRates);

