var codon_matrix = require("../../config/codon_tables.json"),
  fs = require("fs"),
  winston = require("winston"),
  _ = require("underscore");

function parseFasta(text, only_headers, progress_cb) {
  var automatonState = 0,
    current_index = 0,
    current_name = "";
  (current_sequence = []),
    (validChars = {
      "-": 1,
      "*": 1
    });

  for (k = 65; k < 65 + 26; k++) {
    validChars[String.fromCharCode(k)] = 1;
  }

  var result = {
      data: [],
      error: null
    },
    last_done = 0,
    even_percent_done = Math.max(1, Math.round(text.length * 0.01));

  while (current_index < text.length) {
    var currentC = text[current_index];
    current_index++;

    if (progress_cb) {
      if (current_index - last_done >= even_percent_done) {
        last_done = current_index;
        progress_cb((current_index * 100) / text.length);
      }
    }

    if (automatonState == 0) {
      if (currentC == ">" || currentC == "#") {
        automatonState = 1;
      }
    } else {
      if (automatonState == 1) {
        if (currentC == "\n" || currentC == "\r") {
          if (current_name.length <= 0) {
            result["error"] = "Sequence names must be non-empty.";
            return result;
          }

          result["data"].push({
            name: current_name
          });

          current_name = "";
          automatonState = 2;
        } else {
          current_name += currentC;
        }
      } else {
        if (!only_headers) {
          currentC = currentC.toUpperCase();
          if (currentC in validChars) {
            current_sequence.push(currentC);
          } else {
            if (currentC == ">" || currentC == "#") {
              automatonState = 1;
              result["data"][
                result["data"].length - 1
              ].seq = current_sequence.join("");
              current_sequence.length = 0;
            }
          }
        } else {
          if (currentC == ">" || currentC == "#") {
            automatonState = 1;
          }
        }
      }
    }
  }

  if (automatonState == 2) {
    if (!only_headers) {
      result["data"][result["data"].length - 1].seq = current_sequence.join("");
    }
    automatonState = 1;
  } else {
    result["error"] = "Unexpected end of file";
  }

  if (progress_cb) {
    progress_cb(100);
  }
  return result;
}

function parseFile(fn, cb, options) {
  var options = {};

  fs.readFile(fn, function(err, data) {
    if (err) {
      cb("Could not read file!", {});
    } else {
      results = parseFasta(
        data.toString(),
        options && options["headers-only"],
        options["progress-callback"]
      );
      if (results["error"]) {
        cb(results["error"], []);
      } else {
        cb("", results["data"]);
      }
    }
  });
}

function parseSeqEntry(entry) {
  var line = entry.split(/[\r\n]/);
  var defline = line.shift();
  var id = defline.replace(/\s+.+$/, "");
  var desc = defline.replace(/^\S+\s*/, "");
  var sequence = line.join("").replace(/\s+/g, "");
  var seq = {
    id: id,
    desc: desc,
    seq: sequence
  };
  return seq;
}

var getTranslatedAA = function(codon, code) {
  codon = codon_matrix[code].table[codon];
  if (codon) {
    return codon;
  } else {
    return "?";
  }
};

var translate = function(sequence, code) {
  translated_sequence = sequence.seq
    .match(/.{1,3}/g)
    .map(function(x) {
      return getTranslatedAA(x, code);
    })
    .join("");
  sequence.seq = translated_sequence;
  return sequence;
};

function translateSequenceArray(sequence_arr, code) {
  translated_arr = [];
  for (var i = 0; i < sequence_arr.length; i++) {
    translated_arr.push(translate(sequence_arr[i], code));
  }
  return translated_arr;
}

function toFasta(sequence_arr) {
  var fasta_str = "";

  for (var i = 0; i < sequence_arr.length; i++) {
    fasta_str += ">" + sequence_arr[i].name + "\n\n";
    fasta_str += sequence_arr[i].seq + "\n\n";
  }
  return fasta_str;
}

exports.parseFile = parseFile;
exports.getTranslatedAA = getTranslatedAA;
exports.translate = translate;
exports.translateSequenceArray = translateSequenceArray;
exports.toFasta = toFasta;
exports.parseFasta = parseFasta;
