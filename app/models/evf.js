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
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Evf = new Schema({
  msafn             : { type : Schema.Types.ObjectId, ref : 'Msa' },
  status            : String,
  sendmail          : Boolean,
  parameters        : [EvfParameters],
  samples           : [EvfSamples],
  posterior_samples : [EvfPosteriorSamples],
  posteriors        : [EvfPosteriors],
  summary           : [EvfSummary],
  rate_info_summary : [EvfRateInfoSummary],
});

var EvfParameters = new Schema({
  treemode    : Number,
});

var EvfSamples = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Evf' },
});

var EvfPosteriorSamples = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Evf' },
});

var EvfPosteriors = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Evf' },
});

var EvfSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Evf' },
});

var EvfRateInfoSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Evf' },
});

module.exports = mongoose.model('Evf', Evf);
module.exports = mongoose.model('EvfParameters', EvfParameters);
module.exports = mongoose.model('EvfSamples', EvfSamples)
module.exports = mongoose.model('EvfPosteriorSamples', EvfPosteriorSamples)
module.exports = mongoose.model('EvfPosteriors', EvfPosteriors)
module.exports = mongoose.model('EvfSummary', EvfSummary)
module.exports = mongoose.model('EvfRateInfoSummary', EvfRateInfoSummary)
