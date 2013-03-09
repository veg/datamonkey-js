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
