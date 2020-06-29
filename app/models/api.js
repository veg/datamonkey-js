var mongoose = require("mongoose"), //Used for schema
  setup = require("./../../config/setup.js"); //Used for max per api key

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var API = new Schema({
  id: ObjectId,
  created: { type: Date, default: Date.now },
  expires: {
    type: Date,
    default: Date.now() + setup.api_expires_in_sec * 1000,
  }, //Setup value(s) * 1000 = timeout(ms)
  job_request_limit: { type: Number, default: setup.api_request_limit }, //Defined in setup.js
  job_request_made: { type: Number, default: 0 },
  associated_job_ids: [String],
});

/**
 * Iterate counter after job starts
 */
API.virtual("iterate_job_count").get(function () {
  return this.job_request_made++;
});

/**
 * Gives remaining jobs for this UUID
 */
API.virtual("remaining_jobs").get(function () {
  return this.job_request_limit - this.job_request_made;
});

/* Debug, example obj
var api = new API();
api.associated_job_ids.push("TESTING");
api.iterate_job_count;
api.iterate_job_count;
console.log("Jobs remaining = " + api.remaining_jobs);
console.log(api);

{ _id: 5ef4e8746086fb57f0a30fa5,
  associated_job_ids: [ 'TESTING' ],
  job_request_made: 2,
  job_request_limit: 10,
  expires: 2020-06-27T18:09:51.480Z,
  created: 2020-06-25T18:09:56.766Z 
}
Jobs remaining = 8

*/

module.exports = mongoose.model("API", API);
