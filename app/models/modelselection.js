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


//Also needs to include status, and results
require(__dirname + '/slac');
require(__dirname + '/fel');

var mongoose = require('mongoose')
  , SlacModel    = mongoose.model('SlacModel')
  , SlacResults  = mongoose.model('SlacResults')
  , SlacMutation = mongoose.model('SlacMutation')
  , SlacSummary  = mongoose.model('SlacSummary')
  , SlacTrees    = mongoose.model('SlacTrees')
  , FelResults   = mongoose.model('FelResults')
  , FelSummary   = mongoose.model('FelSummary');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var ModelSelection = new Schema({
  msafn         : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status        : String,
  sendmail      : Boolean,
  parameters    : [ModelSelectionParameters],
  slac_model    : [SlacModel],
  slac_results  : [SlacResults],
  slac_mutation : [SlacMutation],
  slac_summary  : [SlacSummary],
  slac_trees    : [SlacTrees],
  fel_results   : [FelResults],
  fel_summary   : [FelSummary]
});

var ModelSelectionParameters = new Schema({
  modelstring : String,
  treemode    : Number,
});

module.exports = mongoose.model('ModelSelection', ModelSelection);
module.exports = mongoose.model('ModelSelectionParameters', ModelSelectionParameters);
