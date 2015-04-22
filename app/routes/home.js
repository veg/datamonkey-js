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
    moment = require('moment'),
    hpcsocket   = require( __dirname + '/../../lib/hpcsocket.js'),
    globals  = require( ROOT_PATH + '/config/globals.js');

exports.homePage = function (req, res) {
  res.render('index.ejs');
};

exports.help = function (req, res) {
  res.render('help.ejs');
};

exports.development = function (req, res) {
  res.render('development.ejs');
};

exports.analyses = function (req, res) {
  res.render('analyses.ejs');
};

exports.treeviewer = function (req, res) {
  res.render('tools/treeviewer.ejs');
};

exports.copyright = function (req, res) {
    res.render ('copyright.ejs');
}

exports.data_privacy = function (req, res) {
    res.render ('data.ejs');
}


exports.jobQueue = function(req, res) {

  function formatJobs (x) {

    //format x
    if(!('status'in x)) {
      x.status = 'n/a';
    }

    if(x.running_time) {
      x.running_time = moment.utc(0).seconds(x.running_time).format("HH:mm:ss");
    } else {
      x.running_time = 'N/A';
    }

    x.creation_time = moment(x.creation_time).utc().format("YYYY-MM-DD HH:mm Z");

    if(x.status == "Queued") {
      var queue_time = moment() - moment(x.creation_time);
      x.queue_time = moment.utc(0).milliseconds(queue_time).format("HH:mm:ss");
    } else {
      x.queue_time = "N/A";
    }

    return x;

  }

  function getObject(analysis, torque_id, callback) {

    Analysis = mongoose.model(analysis);
    Analysis.findOne({torque_id:torque_id}, function(err, result) {

      if(result) {
        job_info = { 'type' : result.__t,
                     'sequences' : result.msa[0].sequences,
                     'id' : result._id,
                     'sites' : result.msa[0].sites};
      } else {
        job_info = null;
      }
      callback(job_info);
    });
  }

  function connect_callback(result) {
    console.log(result);

    var analyses = Object.keys(mongoose.modelSchemas);

    // Decorate each one of the jobs from database queries
    var jobs = [];

    var default_job_info = { 
                             'id'        : null,
                             'type'      : 'n/a',
                             'sequences' : 'n/a',
                             'sites'     : 'n/a'
                            };


    if(!result.length) {
      res.format({
        html: function(){
          res.render('jobqueue.ejs', {'jobs' : jobs});
          res.json(200, jobs);

        },
        json: function() {
          res.json(200, jobs);
        }
      });
    }

    // Decorate result with queue time
    result = result.map(formatJobs);

    var found = false;
    var found_all = false;
    var count = 0;
    var res_sent = false;

    result.forEach(function(torque_elem, i, job_arr) {

      torque_id = torque_elem.id;

      analyses.forEach(function(elem, index, arr) {

        getObject(elem, torque_id, function(job_info) {

          count +=1;

          if(job_info) {
            jobs.push({'job_info' : job_info, 'torque_info' : torque_elem});
            found = true;
          } else if (count == arr.length && !found) {
            jobs.push({'job_info' : default_job_info, 'torque_info' : torque_elem});
          }

          if(jobs.length == job_arr.length && !found_all) {

            jobs = jobs.sort(function (a, b) {

              if (a.torque_info.status > b.torque_info.status) {
                return 1;
              }

              if (a.torque_info.status < b.torque_info.status) {
                return -1;
              }

              // a must be equal to b
              return 0;

            });
            
            if(!res_sent) {
              res_sent = true;
              res.format({
                html: function(){
                  res.render('jobqueue.ejs', {'jobs' : jobs});
                },
                json: function() {
                  res.json(200, jobs);
                }
              });
            }
          }

        });
      });
    });
  }

  var jobproxy = new hpcsocket.JobQueue(connect_callback);

};

exports.clusterhealth= function (req, res) {

  function connect_callback(result) {
    res.json(200, result);
  }

  var jobproxy = new hpcsocket.ClusterStatus(connect_callback);


};

exports.stats = function (req, res) {
  res.render('stats.ejs', {'types' : globals.types });
};

exports.stats_test = function (req, res) {
  res.render('stats_test.ejs', {'types' : globals.types });
};

