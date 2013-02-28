var querystring = require('querystring');
var globals = require('../config/globals.js');

var mongoose = require('mongoose')
  , SequenceAlignmentFile = mongoose.model('SequenceAlignmentFile')
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

  console.log(analysis.status);

  //Get Sequence Alignment from file
  SequenceAlignmentFile.findOne({_id : analysis.msafn}, function(err, msa) {

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
      debugger;

      //If PHP file exists
      if (fs.existsSync(globals.spooldir + msa.uploadfn + "_" + type + ".php")) {

        var last_mod = fs.statSync(globals.spooldir + msa.uploadfn + "_" + type + ".php").mtime;
        var now = new Date();

        if((now.getTime() -last_mod.getTime() ) > 1000) {
          new_status = globals.finished;
        }

      }
      
      //If TXT file exists
      else if (fs.existsSync(globals.spooldir + msa.uploadfn + "_" + type + ".txt")) {
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
