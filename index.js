(function(define){define(function(require,exports,module){

/**
 * Dependencies
 */

var fastdom = require('fastdom');

exports.read = function(fn) {
  return createPromise(function(resolve, reject) {
    fastdom.read(function() {
      try { resolve(fn()); }
      catch (e) { reject(e); }
    });
  });
};

exports.write = function(fn) {
  return createPromise(function(resolve, reject) {
    fastdom.write(function() {
      try { resolve(fn()); }
      catch (e) { reject(e); }
    });
  });
};

exports.defer = function() {
  return createPromise(function(resolve, reject) {
    fastdom.defer(function() {
      try { resolve(fn()); }
      catch (e) { reject(e); }
    });
  });
};

function createPromise(fn) {
  var promise = new Promise(fn);

  promise.thenWrite = function(fn) {
    return this.then(function() {
      return exports.write(fn);
    });
  };

  promise.thenRead = function(fn) {
    return this.then(function() {
      return exports.read(fn);
    });
  };

  promise.thenDefer = function(fn) {
    return this.then(function() {
      return exports.read(fn);
    });
  };

  return promise;
}

});})((function(n,w){return typeof define=='function'&&define.amd?
define:typeof module=='object'?function(c){c(require,exports,module);}:
function(c){var m={exports:{}},r=function(n){return w[n];};
w[n]=c(r,m.exports,m)||m.exports;};})('fastdom-promise',this));