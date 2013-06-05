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
require(__dirname + '/meme');
require(__dirname + '/fubar');

var mongoose = require('mongoose')
  , SlacResults   = mongoose.model('SlacResults')
  , SlacMutation  = mongoose.model('SlacMutation')
  , SlacSummary   = mongoose.model('SlacSummary')
  , SlacTrees     = mongoose.model('SlacTrees')
  , MemeResults   = mongoose.model('MemeResults')
  , MemeMappings  = mongoose.model('MemeMappings')
  , MemeSummary   = mongoose.model('MemeSummary')
  , FubarResults  = mongoose.model('FubarResults')
  , FubarGrid     = mongoose.model('FubarGrid')
  , FubarSummary  = mongoose.model('FubarSummary')
  , FubarSiteInfo = mongoose.model('FubarSiteInfo')
  , FubarMcmcTrace= mongoose.model('FubarMcmcTrace');
  

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Parris = new Schema({
  msafn               : { type : Schema.Types.ObjectId, ref : 'Msa' },
  status              : String,
  sendmail            : Boolean,
  parameters          : [ParrisParameters],
  parrisdistributions : [ParrisDistributions],
  parrissummary       : [ParrisSummary],
  slacresults         : [SlacResults],
  slacmutation        : [SlacMutation],
  slacsummary         : [SlacSummary],
  slactrees           : [SlacTrees],
  memeresults         : [MemeResults],
  mememappings        : [MemeMappings],
  memesummary         : [MemeSummary],
  fubarresults        : [FubarResults],
  fubargrid           : [FubarGrid],
  fubarsummary        : [FubarSummary],
  fubarsiteinfo       : [FubarSiteInfo],
  fubarmcmctrace      : [FubarMcmcTrace],
});

var ParrisParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var ParrisDistributions = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Parris' },
  variable : String,
  rate     : Number,
  value    : Number,
  prob     : Number
});

var ParrisSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Parris' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Parris', Parris);
module.exports = mongoose.model('ParrisParameters', ParrisParameters);
module.exports = mongoose.model('ParrisDistributions', ParrisDistributions);
module.exports = mongoose.model('ParrisSummary', ParrisSummary);

