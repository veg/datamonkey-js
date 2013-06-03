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


var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var Slac = new Schema({
  msafn        : { type : Schema.Types.ObjectId, ref : 'Msa' },
  status       : String,
  sendmail     : Boolean,
  parameters   : [SlacParameters],
  slacsummary  : [SlacSummary],
  slacmutation : [SlacMutation],
  slactrees    : [SlacTrees],
  slacmodel    : [SlacModel],
  slacresults  : [SlacResults],
});

var SlacParameters = new Schema({
  roptions    : Number,
  pvalue      : Number,
  dnds        : Number,
  ambchoice   : Number,
  modelstring : String,
  treeMode    : Number
});


var SlacTrees = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Slac' },
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

var SlacModel = new Schema({
  model : String
});

var SlacMutation = new Schema({
  partition  : Number,
  branch     : String,
  site       : Number,
  abssite    : Number,
  startcodon : String,
  endcodon   : String,
  startaa    : String,
  endaa      : String,
  ns         : Number,
  s          : Number
});

var SlacResults = new Schema({
  field_0  : Number,
  field_1  : Number,
  field_2  : Number,
  field_3  : Number,
  field_4  : Number,
  field_5  : Number,
  field_6  : Number,
  field_7  : Number,
  field_8  : Number,
  field_9  : Number,
  field_10 : Number,
  field_11 : Number,
  field_12 : Number
});

var SlacSummary = new Schema({
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Slac', Slac);
module.exports = mongoose.model('SlacParameters', SlacParameters);
module.exports = mongoose.model('SlacSummary', SlacSummary);
module.exports = mongoose.model('SlacMutation', SlacMutation);
module.exports = mongoose.model('SlacTrees', SlacTrees);
module.exports = mongoose.model('SlacModel', SlacModel);
module.exports = mongoose.model('SlacResults', SlacResults);

