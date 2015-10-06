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
    _      = require('underscore');

require(path.join(__dirname, '../../src/bower-components/d3/d3.js'));
require(path.join(__dirname, '../../src/bower-components/underscore/underscore.js'));
require(path.join(__dirname, '/../../public/assets/lib/datamonkey/hivtrace/misc.js'));

describe('convert object to csv', function() {

  it('elements should not be empty', function(done) {

      trace_results = JSON.parse(fs.readFileSync(path.join(__dirname, './test.trace.json')));
      datamonkey.hivtrace.convert_to_csv(trace_results, function(err, results) {

        parsed_obj = d3.csv.parse(results);

        // ensure each key exists and has a value
        function hasNonEmptyElements(element, index, array) {
          return (Boolean(element.seqid) && 
                  Boolean(element.cluster) && 
                  Boolean(element.betweenness) && 
                  Boolean(element.degree) && 
                  Boolean(element.is_contaminant));
        }

        parsed_obj.every(hasNonEmptyElements).should.be.true;
        done();
      
      });

  });

  it('elements should mark contaminants correctly', function(done) {

    trace_results = JSON.parse(fs.readFileSync(path.join(__dirname, './test.trace.json')));
    datamonkey.hivtrace.convert_to_csv(trace_results, function(err, results) {
      parsed_obj = d3.csv.parse(results);

      // ensure that NL4-3 and HXB2_env are tagged as contaminants

      // Should mark which contaminant
      var contaminants = parsed_obj.filter(function(elem){return elem.is_contaminant == 'true'});
      var contaminant_ids = contaminants.map(function(elem) {return elem['seqid']});
      contaminant_ids.indexOf('NL4-3').should.not.be.equal(-1);
      contaminant_ids.indexOf('HXB2_env').should.not.be.equal(-1);
      done();
    });
    
  });

});

describe('betweenness centrality', function() {


  var krackhardt_kite = JSON.parse(fs.readFileSync(path.join(__dirname, './krackhardt_kite.json')));
  var large_results = JSON.parse(fs.readFileSync(path.join(__dirname, './large.trace.json')));
  var delta = .001;

  it('should correctly compute', function(done) {

    
    var heather  = datamonkey.hivtrace.betweenness_centrality('Heather', krackhardt_kite);
        fernando = datamonkey.hivtrace.betweenness_centrality('Fernando', krackhardt_kite),
        garth    = datamonkey.hivtrace.betweenness_centrality('Garth', krackhardt_kite),
        ike      = datamonkey.hivtrace.betweenness_centrality('Ike', krackhardt_kite),
        diane    = datamonkey.hivtrace.betweenness_centrality('Diane', krackhardt_kite),
        andre    = datamonkey.hivtrace.betweenness_centrality('Andre', krackhardt_kite),
        beverly  = datamonkey.hivtrace.betweenness_centrality('Beverly', krackhardt_kite);

    heather.should.be.approximately(.389, delta);
    fernando.should.be.approximately(.231, delta);
    garth.should.be.approximately(.231, delta);
    ike.should.be.approximately(.222, delta);
    diane.should.be.approximately(.102, delta);
    andre.should.be.approximately(.023, delta);
    beverly.should.be.approximately(.023, delta);

    done();
    
  });

  it('should finish in due time', function(done) {

    this.timeout(3000);

    // 114 node cluster
    var cn_2006 = datamonkey.hivtrace.betweenness_centrality('01AE_CN_FJ531421_2006', large_results);
    cn_2006.should.be.approximately(.009, delta)
    done();

  });

  it('should only compute betweenness for all nodes in cluster', function(done) {

    this.timeout(10000);

    var cb = function(err, result) {
      done();
    }

    //var cluster_id = '105';
    var cluster_id = '273';
    datamonkey.hivtrace.betweenness_centrality_all_nodes_in_cluster(cluster_id, large_results, cb);

  });

  it('check adjacency list', function(done) {

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

    var adj_list = datamonkey.hivtrace.cluster_adjacency_list(krackhardt_kite);

    for (id in adj_list) {
      ids = adj_list[id].map(function(n) { return n.id } );
      _.difference(ids, answers[id]).length.should.be.equal(0);
    }

    done();

  });

});


describe('local clustering coefficient', function() {

  var krackhardt_kite = JSON.parse(fs.readFileSync(path.join(__dirname, './krackhardt_kite.json')));

  it('should spawn a worker and complete', function(done) {

    this.timeout(5000);

    // pass to web-worker
    var Worker = require('webworker-threads').Worker;

    var worker = new Worker(function(){
        importScripts('./public/assets/lib/d3/d3.js', './public/assets/lib/underscore/underscore.js', './public/assets/lib/datamonkey/hivtrace/misc.js');
        this.onmessage = function(event) {
            try {
              datamonkey.hivtrace.compute_local_clustering(event.data);
              postMessage(event.data);
              self.close();
            } catch(e) {
                var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                  .replace(/^\s+at\s+/gm, '')
                  .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                  .split('\n');
            };
        };
    });

    worker.onmessage = function(event) {
      console.log("Worker said : " + JSON.stringify(event.data.Nodes[0]));
      done();
    };

    worker.postMessage(krackhardt_kite);

  });


});


