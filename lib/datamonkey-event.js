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

var querystring = require('querystring');
var globals = require('../config/globals.js');

var mongoose = require('mongoose')
  , Msa = mongoose.model('Msa')
  , Meme = mongoose.model('Meme')
  , MemeParameters = mongoose.model('MemeParameters');

var fs = require('fs');
var util = require('util');
var events = require('events');
var EventEmitter = events.EventEmitter;

// Object that checks status of job
var jobListener = function(){};

util.inherits(jobListener, events.EventEmitter);

jobListener.prototype.parseCurrentStatus = function (self,type,analysis) {

  //Get Sequence Alignment from file
  Msa.findOne({_id : analysis.msafn}, function(err, msa) {


    //First check what the current status is. If it is "Finished", then do not proceed
    if (analysis.status == globals.finished) {
      self.emit('status', self, analysis.status);
      console.log(analysis.status);
      clearInterval(self.intervalId);
      return;
    }

    else if (analysis.status == globals.cancelled) {
      self.emit('status', self, analysis.status);
      console.log(analysis.status);
      clearInterval(self.intervalId);
      return;
    }

    //State is currently queued or running
    else {

      //If PHP file exists
      if (fs.existsSync(globals.spooldir + msa.msaid + "_" + type + ".php")) {

        var last_mod = fs.statSync(globals.spooldir + msa.msaid + "_" + type + ".php").mtime;
        var now = new Date();

        if((now.getTime() -last_mod.getTime() ) > 1000) {
          new_status = globals.finished;
        }

      }
      
      //If TXT file exists
      else if (fs.existsSync(globals.spooldir + msa.msaid + "_" + type + ".txt")) {
        new_status = globals.running;
      }

      //No files, must be queued
      else {
        new_status = globals.queue;
      }

      //Check if state has changed. 
      analysis.status = new_status,

      //Update the status for the analysis
      analysis.save( function (err, result) {
        if (err) {res.send({ 'error': err }); }    
        else {
          self.emit('status', self, analysis, msa);

          //TODO: All logic should be done in a custom listener defined by the instigator
          if (analysis.status == globals.finished || analysis.status == globals.cancelled) {
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
  this.intervalId = setInterval(self.parseCurrentStatus,globals.pollingdelay,self,type,analysis);
};

var jobListener = new jobListener();

// Perhaps we can create this elsewhere
exports.jobListener = jobListener;
