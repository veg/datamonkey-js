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


var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');

var AnalysisSchema = require(__dirname + '/analysis');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Mixed = mongoose.Schema.Types.Mixed;

var Uds = AnalysisSchema.extend({
  minread             : {type: Number, require: true},
  scoreM              : {type: Number, require: true},
  mincoverage         : {type: Number, require: true},
  windowsize          : {type: Number, require: true},
  windowstride        : {type: Number, require: true},
  mincopycount        : {type: Number, require: true},
  nucdivthreshold     : {type: Number, require: true},
  dodr                : {type: Number, require: true},
  mindrugscore        : {type: Number, require: true},
  mindrugcoverage     : {type: Number, require: true},
  lovemelongtime      : {type: String, require: true},
  lovemelikeyouwantto : {type: String, require: true},
  aa_alignment        : [UdsAaAlignment],
  accessory_mutations : [UdsAccessoryMutations],
  accessory_test      : [UdsAccessoryTest],
  base_frequencies    : [UdsBaseFrequencies],
  diversity_sw        : [UdsDiversitySw],
  diversity_sws       : [UdsDiversitySws],
  dnds                : [UdsDnds],
  legend              : [UdsLegend],
  mdr_summary         : [UdsMdrSummary],
  mdr_variants        : [UdsMdrVariants],
  mu_rate_classes     : [UdsMuRateClasses],
  nuc_alignment       : [UdsNucAlignment],
  sequences           : [UdsSequences],
  settings            : [UdsSettings],
  site_dr_posteriors  : [UdsSiteDrPosteriors],
  site_mu_rates       : [UdsSiteMuRates],
  site_posteriors     : [UdsSitePosteriors],
  uds_file_info       : [UdsFileInfo],
  uds_qc_stats        : [UdsQcStats],
});

var UdsAaAlignment = new Schema({
  _creator       : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  aaa            : Number,
  aac            : Number,
  aag            : Number,
  aat            : Number,
  aca            : Number,
  acc            : Number,
  acg            : Number,
  act            : Number,
  aga            : Number,
  agc            : Number,
  agg            : Number,
  agt            : Number,
  ata            : Number,
  atc            : Number,
  atg            : Number,
  att            : Number,
  caa            : Number,
  cac            : Number,
  cag            : Number,
  cat            : Number,
  cca            : Number,
  ccc            : Number,
  ccg            : Number,
  cct            : Number,
  cga            : Number,
  cgc            : Number,
  cgg            : Number,
  cgt            : Number,
  consensus      : String,
  consensus_aa   : String,
  coverage       : Number,
  cta            : Number,
  ctc            : Number,
  ctg            : Number,
  ctt            : Number,
  gaa            : Number,
  gac            : Number,
  gag            : Number,
  gat            : Number,
  gca            : Number,
  gcc            : Number,
  gcg            : Number,
  gct            : Number,
  gga            : Number,
  ggc            : Number,
  ggg            : Number,
  ggt            : Number,
  gta            : Number,
  gtc            : Number,
  gtg            : Number,
  gtt            : Number,
  indel_position : Number,
  position       : Number,
  reference      : String,
  reference_aa   : String,
  tac            : Number,
  tat            : Number,
  tca            : Number,
  tcc            : Number,
  tcg            : Number,
  tct            : Number,
  tgc            : Number,
  tgg            : Number,
  tgt            : Number,
  tta            : Number,
  ttc            : Number,
  ttg            : Number,
  ttt            : Number
});

var UdsAccessoryMutations = new Schema({
  _creator        : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  read_id         : String,
  primary_site    : Number,
  primary_wt      : String,
  primary_rt      : String,
  primary_obs     : String,
  secondary_site  : Number,
  secondary_wt    : String,
  secondary_rt    : String,
  secondary_obs   : String,
  hxb2_aa         : String,
  read_aa         : String,
  per_base_sc     : Number,
  exp_per_base_sc : Number
});

var UdsAccessoryTest = new Schema({
  _creator     : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  dr_acc       : String,
  notdr_acc    : Number,
  dr_notacc    : String,
  notdr_notacc : String,
  p_val        : Number
});

var UdsBaseFrequencies = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  matrix      : String
});

var UdsDiversitySw = new Schema({
  _creator              : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  width                 : Number,
  stride                : Number,
  min_coverage          : Number,
  div_threshold         : Number,
  num_windows           : Number,
  max_divergence        : Number,
  max_divergence_window : Mixed,
  dual_infection        : Mixed
});

var UdsDiversitySws = new Schema({
  _creator       : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  start          : Number,
  end            : Number,
  coverage       : Number,
  freq_cutoff    : Number,
  variants       : Number,
  div_ml         : Number,
  div_med        : Number,
  div_25         : Number,
  div_975        : Number,
  dual_infection : Number,
  nuc_align      : Number
});

var UdsDnds = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  pos          : Number,
  cons_aa      : String,
  s_sites      : Number,
  ns_sites     : Number,
  s_subs       : Number,
  ns_subs      : Number,
  pp_number    : Number,
  pn_number    : Number
});

var UdsLegend = new Schema({
  _creator    : { type : Schema.Types.ObjectId, ref : 'Uds' },
  table_name  : String,
  field_name  : String,
  description : String
});

var UdsMdrSummary = new Schema({
  _creator       : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  ref_gene       : String,
  drug_class     : String,
  median_mut_rnk : Number,
  p_value        : Number,
  dr_score       : Number,
  dr_coverage    : Number
});

var UdsMdrVariants = new Schema({
  _creator         : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  mdr_site         : Number,
  site_gene_start  : Number,
  drug_class       : Mixed,
  drug_report      : Mixed,
  coverage         : Number,
  wildtype         : Number,
  wildtype_prcnt   : Number,
  resistance       : Number,
  resistance_prcnt : Number,
  ci               : Mixed,
  other            : Number,
  other_prcnt      : Number,
  entropy          : Number,
  mu               : Number,
  mu_rnk_prctl     : Number
});

var UdsMuRateClasses = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  num_rates  : Number,
  rate_class : Number,
  mu_rate    : Number,
  weight     : Number,
  log_lk     : Number,
  aic        : Number
});

var UdsNucAlignment = new Schema({
  _creator       : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  a              : Number,
  ambig          : Number,
  c              : Number,
  consensus      : String,
  coverage       : Number,
  del            : Number,
  g              : Number,
  indel_position : Number,
  position       : Number,
  reference      : String,
  t              : Number
});

var UdsSequences = new Schema({
  _creator             : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  aligned              : String,
  aligned_aa           : String,
  aligned_aa_ref       : String,
  aligned_notclean     : String,
  aligned_notclean_ref : String,
  length               : Number,
  nuc_pass2            : String,
  offset               : Number,
  offset_nuc           : Number,
  offset_pass2         : Number,
  raw                  : String,
  rc                   : Number,
  ref_pass2            : String,
  score                : Number,
  score_pass2          : Number,
  sequence_id          : { type: Number , index: { unique: true }}, 
  span                 : Number,
  span_pass2           : Number,
  stage                : Number,
  toolong              : Number,
  tooshort             : Number
});

var UdsSettings = new Schema({
  _creator                 : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  dual_infection_threshold : Number,
  exp_per_base_score       : Number,
  genetic_code             : String,
  min_copies               : Number,
  min_coverage             : Number,
  min_dr_coverage          : Number,
  min_length               : String,
  uds_options              : String,
  prot_score_matrix        : String,
  reference                : String,
  reference_pass2          : String,
  run_date                 : Date,
  stanford_score           : Number,
  sw_size                  : Number,
  sw_stride                : Number,
  threshold                : Number,
  threshold_pass2          : Number
});

var UdsSiteDrPosteriors = new Schema({
  _creator        : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  mdr_site        : Number,
  site_gene_start : Number,
  coverage        : Number,
  resistance      : Number,
  rate_class      : Number,
  rate            : Number,
  weight          : Number,
  posterior       : Number
});

var UdsSiteMuRates = new Schema({
  _creator          : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  site              : Number,
  coverage          : Number,
  consensus         : Number,
  entropy           : Number,
  mu                : Number,
  mu_rnk_prcnt      : Number
});

var UdsSitePosteriors = new Schema({
  _creator   : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  site       : Number,
  coverage   : Number,
  consensus  : Number,
  rate_class : Number,
  rate       : Number,
  weight     : Number,
  posterior  : Number
});

var UdsFileInfo = new Schema({
  _creator  : { type   : Schema.Types.ObjectId, ref : 'Uds' },
  sequences : Number,
  timestamp : Number,
  original  : String
});

var UdsQcStats = new Schema({
  _creator    : { type : Schema.Types.ObjectId, ref : 'Uds' },
  read_type   : String,
  mean        : Number,
  median      : Number,
  variance    : Number,
  sd          : Number,
  min         : Number,
  lowerprcntl : Number,
  upperprcntl : Number,
  max         : Number
});

module.exports = mongoose.model('Uds', Uds);
module.exports = mongoose.model('UdsAaAlignment', UdsAaAlignment);
module.exports = mongoose.model('UdsAccessoryMutations', UdsAccessoryMutations);
module.exports = mongoose.model('UdsAccessoryTest', UdsAccessoryTest);
module.exports = mongoose.model('UdsBaseFrequencies', UdsBaseFrequencies);
module.exports = mongoose.model('UdsDiversitySw', UdsDiversitySw);
module.exports = mongoose.model('UdsDiversitySws', UdsDiversitySws);
module.exports = mongoose.model('UdsDnds', UdsDnds);
module.exports = mongoose.model('UdsLegend', UdsLegend);
module.exports = mongoose.model('UdsMdrSummary', UdsMdrSummary);
module.exports = mongoose.model('UdsMdrVariants', UdsMdrVariants);
module.exports = mongoose.model('UdsMuRateClasses', UdsMuRateClasses);
module.exports = mongoose.model('UdsNucAlignment', UdsNucAlignment);
module.exports = mongoose.model('UdsSequences', UdsSequences);
module.exports = mongoose.model('UdsSettings', UdsSettings);
module.exports = mongoose.model('UdsSiteDrPosteriors', UdsSiteDrPosteriors);
module.exports = mongoose.model('UdsSiteMuRates', UdsSiteMuRates);
module.exports = mongoose.model('UdsSitePosteriors', UdsSitePosteriors);
module.exports = mongoose.model('UdsFileInfo', UdsFileInfo);
module.exports = mongoose.model('UdsQcStats', UdsQcStats);
