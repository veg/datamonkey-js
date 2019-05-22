var logger = require(__dirname + "/logger");
var fs = require("fs");
var async = require("async");
var path = require("path");
var _ = require("underscore");

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.camelCase = function(delim) {
  delim = delim ? delim : " ";
  return this.toLowerCase()
    .split(delim)
    .map(function(v) {
      return v.capitalize();
    })
    .join("");
};

/*
  Taken from http://stackoverflow.com/a/14387791
 */
exports.copyFile = function(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
};

/* checks if array of files/folders are all on the same device */
exports.sameDev = function(files, cb) {
  if (files.length < 2) {
    cb(null, true);
  } else {
    async.map(files, fs.stat, function(err, results) {
      if (err) {
        cb(err);
      } else {
        var bools = _.map(results, function(i) {
          return i.dev == results[0].dev;
        });
        cb(err, _.every(bools));
      }
    });
  }
};

/*
  Does a rename if target is on the same device as source.
  Otherwise copies source to target and deletes source.
  */
exports.moveSafely = function(src, dst, final_cb) {
  var dstDir = path.dirname(dst);

  // check if dstDir exists
  fs.mkdir(dstDir, function(e) {
    if (e && !(e && e.code === "EEXIST")) {
      final_cb(e);
    } else {
      exports.sameDev([src, dstDir], function(err, onSame) {
        if (err) {
          final_cb(err);
        } else {
          if (onSame) {
            fs.rename(src, dst, final_cb);
          } else {
            async.series(
              [
                function(cb) {
                  exports.copyFile(src, dst, cb);
                },
                function(cb) {
                  fs.unlink(src, cb);
                }
              ],
              final_cb
            );
          }
        }
      });
    }
  });
};
