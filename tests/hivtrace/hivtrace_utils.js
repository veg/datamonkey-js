/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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

var fs     = require('fs'),
    path   = require('path'),
    should = require('should'),
    _      = require('underscore'),
    jsdom  = require("jsdom");

var hiv_utils = fs.readFileSync(path.join(__dirname, '/../../public/assets/lib/datamonkey/hivtrace/misc.js'));
var d3_js = fs.readFileSync(path.join(__dirname, '../../public/assets/lib/d3/d3.js'));
var underscore = fs.readFileSync(path.join(__dirname, '../../public/assets/lib/underscore/underscore.js'));

describe('convert object to csv', function() {

  it('elements should not be empty', function(done) {

    jsdom.env({

      url: "http://datamonkey.org",
      src: [d3_js, underscore, hiv_utils],
      done: function (err, window) {

          datamonkey = window.datamonkey;
          d3 = window.d3;
          trace_results = JSON.parse(fs.readFileSync(path.join(__dirname, './test.trace.json')));
          results = datamonkey.hivtrace.convert_to_csv(trace_results);
          parsed_obj = d3.csv.parse(results);

          // ensure each key exists and has a value
          function hasNonEmptyElements(element, index, array) {
            return (Boolean(element.seqid) && 
                    Boolean(element.cluster) && 
                    Boolean(element.degree) && 
                    Boolean(element.is_contaminant));
          }

          parsed_obj.every(hasNonEmptyElements).should.be.true;
          done();

      }
     });




  });

  it('elements should mark contaminants correctly', function(done) {

    jsdom.env({

      url: "http://datamonkey.org",
      src: [d3_js, underscore, hiv_utils],
      done: function (err, window) {

        datamonkey = window.datamonkey;
        d3 = window.d3;

        trace_results = JSON.parse(fs.readFileSync(path.join(__dirname, './test.trace.json')));
        results = datamonkey.hivtrace.convert_to_csv(trace_results);
        parsed_obj = d3.csv.parse(results);

        // ensure that NL4-3 and HXB2_env are tagged as contaminants

        // Should mark which contaminant
        var contaminants = parsed_obj.filter(function(elem){return elem.is_contaminant == 'true'});
        var contaminant_ids = contaminants.map(function(elem) {return elem['seqid']});
        contaminant_ids.indexOf('NL4-3').should.not.be.equal(-1);
        contaminant_ids.indexOf('HXB2_env').should.not.be.equal(-1);
        done();

      }
     });

  });

});

describe('betweenness centrality', function() {


  var trace_results = JSON.parse(fs.readFileSync(path.join(__dirname, './krackhardt_kite.json')));

  it('should correctly compute', function(done) {

    jsdom.env({
      url: "http://datamonkey.org",
      src: [d3_js, underscore, hiv_utils],
      done: function (err, window) {

          var datamonkey = window.datamonkey;
          var delta = .001;
          
          var heather  = datamonkey.hivtrace.betweenness_centrality('Heather', trace_results),
              fernando = datamonkey.hivtrace.betweenness_centrality('Fernando', trace_results),
              garth    = datamonkey.hivtrace.betweenness_centrality('Garth', trace_results),
              ike      = datamonkey.hivtrace.betweenness_centrality('Ike', trace_results),
              diane    = datamonkey.hivtrace.betweenness_centrality('Diane', trace_results),
              andre    = datamonkey.hivtrace.betweenness_centrality('Andre', trace_results),
              beverly  = datamonkey.hivtrace.betweenness_centrality('Beverly', trace_results);

          heather.should.be.approximately(.389, delta);
          fernando.should.be.approximately(.231, delta);
          garth.should.be.approximately(.231, delta);
          ike.should.be.approximately(.222, delta);
          diane.should.be.approximately(.102, delta);
          andre.should.be.approximately(.023, delta);
          beverly.should.be.approximately(.023, delta);

          done();

      }

    });

  });

  it('should finish in due time', function(done) {

    done();

  });

  it('check adjacency list', function(done) {

    jsdom.env({
      url: "http://datamonkey.org",
      src: [d3_js, underscore, hiv_utils],
      done: function (err, window) {

          var datamonkey = window.datamonkey;

          var answers = { 
           "Andre"    : [ "Beverly","Carol","Diane","Fernando" ],
           "Beverly"  : [ "Andre", "Diane", "Ed","Garth" ],
           "Carol"    : [ "Andre", "Diane", "Fernando" ],
           "Diane"    : [ "Andre", "Beverly", "Carol", "Ed", "Fernando", "Garth" ],
           "Ed"       : [ "Beverly", "Diane", "Garth" ],
           "Fernando" : [ "Andre", "Carol", "Diane", "Garth", "Heather" ],
           "Garth"    : [ "Beverly", "Diane", "Ed", "Fernando", "Heather"],
           "Heather"  : [ "Fernando", "Garth", "Ike"],
           "Ike"      : [ "Heather", "Jane" ],
           "Jane"     : [ "Ike" ] 
          };

          var adj_list = datamonkey.hivtrace.cluster_adjacency_list(trace_results);

          for (id in adj_list) {
            ids = adj_list[id].map(function(n) { return n.id } );
            _.difference(ids, answers[id]).length.should.be.equal(0);
          }

          done();
      }
    });
  });
});
