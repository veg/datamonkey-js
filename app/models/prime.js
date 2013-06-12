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


var SlacScheme = require(__dirname + '/slac');
var GardScheme = require(__dirname + '/gard');

var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend');

var AnalysisSchema = require(__dirname + '/analysis');
  
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var Mixed = mongoose.Schema.Types.Mixed;

var Prime = AnalysisSchema.extend({
  parameters   : [PrimeParameters],
  primeresults : [PrimeResults],
  primesummary : [PrimeSummary],
});

var PrimeParameters = new Schema({
  treemode              : Number,
  prime_property_choice : Number,
});

var PrimeResults = new Schema({
  codon : Number,
  attribute : String,
  value : Number
});

var PrimeSummary = new Schema({
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Prime', Prime);
module.exports = mongoose.model('PrimeParameters', PrimeParameters);
module.exports = mongoose.model('PrimeResults', PrimeResults);
module.exports = mongoose.model('PrimeSummary', PrimeSummary);


