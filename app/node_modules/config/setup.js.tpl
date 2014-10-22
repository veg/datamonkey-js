/* Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  'Software'), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

//// PRODUCTION
//define('host','datamonkey-dev');
//define('port', 4000);
//define('socket_port', 4001);
//define('database', 'mongodb://localhost/datamonkey-dev-steven');
//define('logger', 'dev');
//define('cluster_ip','silverback.ucsd.edu:7010');
//define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
//define('hyphy', '/home/sweaver/bin/hyphy/HYPHYMP');

//// QA
//define('host','datamonkey-dev');
//define('port', 4000);
//define('socket_port', 4001);
//define('database', 'mongodb://localhost/datamonkey-dev-steven');
//define('logger', 'dev');
//define('cluster_ip','silverback.ucsd.edu:7010');
//define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
//define('hyphy', '/home/sweaver/bin/hyphy/HYPHYMP');

// DEV
define('host','datamonkey-dev');
define('port', 4000);
define('socket_port', 4001);
define('database', 'mongodb://localhost/datamonkey-dev');
define('logger', 'dev');
define('cluster_ip','http://silverback.ucsd.edu:7000');
define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
define('hyphy', '/home/sweaver/bin/hyphy/HYPHYMP');

