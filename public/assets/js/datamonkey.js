var root = this;

var Datamonkey = function () {};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Datamonkey;
  }
  exports.Datamonkey = Datamonkey;
} else {
  root.Datamonkey = Datamonkey;
}

Datamonkey.errorModal = function (msg) {
  $('#modal-error-msg').text(msg);
  $('#errorModal').modal();
}


