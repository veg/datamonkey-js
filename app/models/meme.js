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
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Meme = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'Msa' },
  id         : { type: Number },
  status     : String,
  sendmail   : Boolean,
  parameters : [MemeParameters],
  results    : [MemeResults],
  mappings   : [MemeMappings],
  summary    : [MemeSummary]
});

var MemeParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var MemeResults = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Meme' },
  codon   : Number,
  beta1   : Number,
  p1      : Number,
  beta2   : Number,
  p2      : Number,
  alpha   : Number,
  lrt     : Number,
  pvalue  : Number,
  logl    : Number,
  qvalue  : Number
});

var MemeMappings = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Meme' },
  tree     : Number,
  codon    : Number,
  branch   : String,
  pp       : Number,
  ebf      : Number,
  syn      : Number,
  nonsyn   : Number
});

var MemeSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'Meme' },
  col_key   : String,
  col_value : String
});

Meme.index({ id: 1 });

module.exports = mongoose.model('Meme', Meme);
module.exports = mongoose.model('MemeParameters', MemeParameters);
module.exports = mongoose.model('MemeResults', MemeResults);
module.exports = mongoose.model('MemeMappings', MemeMappings);
module.exports = mongoose.model('MemeSummary', MemeSummary);
