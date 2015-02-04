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

var codon_matrix = require( '../../config/codon_tables.json'),
    fs = require( 'fs');

function parseFile (fn,cb) {

  fs.readFile(fn, function (err, data) {

    if(err) {

      cb('Could not parse file!', {});

    } else {

      str = data.toString();
      var seqArray=[];

      var seqEntry=str.split('>');
      seqEntry.filter(function(element){ element != ""});

      for(var i=0;i<seqEntry.length;i++){
        seqEntry[i]=seqEntry[i].replace(/^\s+|\s+$/g,"");
        if(seqEntry[i]=="") continue;
        var seq=parseSeqEntry(seqEntry[i]);
        seqArray.push(seq);
      }

      seq=seqArray;
      cb('', seqArray);

    }

  });

}

function parseSeqEntry(entry) {
  var line=entry.split(/[\r\n]/);
  var defline=line.shift();
  var id=defline.replace(/\s+.+$/,"");
  var desc=defline.replace(/^\S+\s*/,"");
  var sequence=line.join("").replace(/\s+/g,"");
  var seq = {id:id,desc:desc,seq:sequence};
  return seq;
}

getTranslatedAA = function(codon, code) {
  codon = codon_matrix[code].table[codon];
  if(codon) {
    return codon;
  } else {
    return '?';
  }
}

translate = function(sequence, code) {
  translated_sequence = sequence.seq.match(/.{1,3}/g).map(function(x) { return getTranslatedAA(x, code); } ).join('')
  sequence.seq = translated_sequence;
  return sequence
}

function translateSequenceArray(sequence_arr, code) {
  translated_arr = [];
  for(var i=0; i < sequence_arr.length; i++) {
    translated_arr.push(translate(sequence_arr[i], code));
  }
  return translated_arr;
}

function toFasta(sequence_arr) {
  var fasta_str = '';

  for(var i=0; i < sequence_arr.length; i++) {
    fasta_str += '>' + sequence_arr[i].id  + '\n\n';
    fasta_str += sequence_arr[i].seq + '\n\n';
  }
  return fasta_str;
}

exports.parseFile = parseFile;
exports.getTranslatedAA = getTranslatedAA;
exports.translate = translate;
exports.translateSequenceArray = translateSequenceArray;
exports.toFasta = toFasta;
