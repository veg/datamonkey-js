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

var globals = require( ROOT_PATH + '/config/globals.js');

var mongoose = require('mongoose'),
  Msa = mongoose.model('Msa');

var fs           = require('fs'),
    querystring  = require('querystring'),
    util         = require('util'),
    events       = require('events'),
    EventEmitter = events.EventEmitter;

// Object that checks status of job
var jobListener = function () {};

util.inherits(jobListener, events.EventEmitter);

jobListener.prototype.parseCurrentStatus = function (self, type, analysis) {

  // Model Selection is a special case
  if (type == "modelselection") {
    type = "model";
  }

  // Get Sequence Alignment from file
  Msa.findOne({ _id : analysis.upload_id}, function (err, msa) {
    // First check what the current status is. 
    // If it is "Finished", then do not proceed
    if (analysis.status == globals.finished) {
      self.emit('status', self, analysis.status);
      clearInterval(self.intervalId);
      return;
    } else if (analysis.status == globals.cancelled) {
      self.emit('status', self, analysis.status);
      clearInterval(self.intervalId);
      return;
    } else {
      //State is currently queued or running
      var new_status = analysis.status;

      //If PHP file exists
      if (fs.existsSync(SPOOL_DIR + msa.upload_id + "_" + type + ".php")) {

        var last_mod = fs.statSync(SPOOL_DIR + msa.upload_id + "_" + type 
                                   + ".php").mtime;
        var now = new Date();

        if ((now.getTime() - last_mod.getTime() ) > 1000) {
          new_status = globals.finished;
          analysis.finish_time = now;
        }

      } else if (fs.existsSync(SPOOL_DIR + msa.upload_id + "_" + type 
                 + ".txt")) {
        //If TXT file exists
        new_status = globals.running;
      } else {
        //No files, must be queued
        new_status = globals.queue;
      }

      analysis.status = new_status;

      //Update the status for the analysis
      analysis.save( function (err, result) {
        if (err) {
          res.json(500, error.errorResponse(err)); 
        } else {

          self.emit('status', self, analysis, msa);

          // TODO: All logic should be done in a custom listener defined by the
          // instigator
          if (analysis.status == globals.finished || 
              analysis.status == globals.cancelled) {
            clearInterval(self.intervalId);
          }
          return;
        }
      });
    }
  });
}

jobListener.prototype.start = function(type,analysis) {
  var self = this;
  self.intervalId = setInterval(self.parseCurrentStatus,globals.pollingdelay,self,type,analysis);
};


// Perhaps we can create this elsewhere
exports.jobListener = jobListener;
