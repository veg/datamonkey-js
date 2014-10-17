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

var logger = require('./logger');
var _ = require("underscore");

module.exports.errorResponse = function(message) {
  return {"error" : message};
}


/*
  Factory for error loggers.

  If ignoreCodes is given, errors with codes in that array are
  ignored.

  if logCodes is given, only errors with codes in that array are
  logged.
 */
module.exports.errorLogger = function(ignoreCodes, logCodes) {
  return function(e) {
    if(!e) {
      return;
    }
    if(ignoreCodes) {
      if(_.contains(ignoreCodes, e.code)) {
        return;
      }
    }
    if(logCodes) {
      if(!_.contains(logCodes, e.code)) {
        return;
      }
    }
    logger.error(e);
  }
}
