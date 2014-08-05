(function(define){define(function(require,exports,module){

/**
 * Dependencies
 */

var fastdom = require('fastdom');

exports.read = function(fn, args) {
  return createPromise(function(resolve, reject) {
    fastdom.read(function() {
      try { resolve(fn.apply(this, args)); }
      catch (e) { reject(e); }
    });
  });
};

exports.write = function(fn, args) {
  return createPromise(function(resolve, reject) {
    fastdom.write(function() {
      try { resolve(fn.apply(this, args)); }
      catch (e) { reject(e); }
    });
  });
};

exports.defer = function(fn, args) {
  return createPromise(function(resolve, reject) {
    fastdom.defer(function() {
      try { resolve(fn.apply(this, args)); }
      catch (e) { reject(e); }
    });
  });
};

function createPromise(fn) {
  var promise = new Promise(fn);
  var then = promise.then;

  promise.thenWrite = function(fn) {
    return this.then(function() {
      return exports.write(fn, arguments);
    });
  };

  promise.thenRead = function(fn) {
    return this.then(function() {
      return exports.read(fn, arguments);
    });
  };

  promise.thenDefer = function(fn) {
    return this.then(function() {
      return exports.read(fn, arguments);
    });
  };

  promise.then = function(fn) {
    var self = this;
    return createPromise(function(resolve, reject) {
      then.call(self, function() {
        try { resolve(fn()); }
        catch (e) { reject(e); }
      }).catch(function(e) {
        console.log('waa');
        reject(e);
      });
    });

    // return createPromise(function(resolve, reject) {
    //   then.call(self, function() {
    //     try { resolve(fn.apply(this, arguments)); }
    //     catch (e) { reject(e); }
    //   });
    // });
  };

  promise.read = promise.thenRead;
  promise.write = promise.thenWrite;
  promise.defer = promise.thenDefer;

  return promise;
}

function CustomPromise(fn) {
  this.promise = new Promise(fn);
}

CustomPromise.create = function(fn) {
  return new CustomPromise(fn);
};

CustomPromise.prototype.thenWrite = function(fn) {
  return this.then(function() {
    return exports.write(fn, arguments);
  });
};

CustomPromise.prototype.thenRead = function(fn) {
  return this.then(function() {
    return exports.read(fn, arguments);
  });
};

CustomPromise.prototype.thenDefer = function(fn) {
  return this.then(function() {
    return exports.read(fn, arguments);
  });
};

CustomPromise.prototype.then = function(fn) {
  var self = this;
  return CustomPromise.create(function(resolve, reject) {
    self.promise.then(function() {
      try { resolve(fn.apply(this, arguments)); }
      catch (e) { reject(e); }
    });
  });
};

CustomPromise.prototype.catch = function(fn) {
  return this.promise.catch(fn);
};

// Shorthand
CustomPromise.prototype.write = CustomPromise.prototype.thenWrite;
CustomPromise.prototype.defer = CustomPromise.prototype.thenDefer;
CustomPromise.prototype.read = CustomPromise.prototype.thenRead;

});})((function(n,w){return typeof define=='function'&&define.amd?
define:typeof module=='object'?function(c){c(require,exports,module);}:
function(c){var m={exports:{}},r=function(n){return w[n];};
w[n]=c(r,m.exports,m)||m.exports;};})('fastdom-promise',this));