(function(define){define(function(require,exports,module){

/**
 * Dependencies
 */

var fastdom = require('fastdom');

/**
 * Exports
 */

exports.write = function(fn) { return new WrappedPromise(write(fn)); };
exports.defer = function(fn) { return new WrappedPromise(defer(fn)); };
exports.read = function(fn) { return new WrappedPromise(read(fn)); };

/**
 * Promise returning version
 * of `fastdom.read`
 *
 * @param  {Function} fn
 * @return {Promise}
 */
function read(fn, ctx) {
  return new Promise(function(resolve, reject) {
    fastdom.read(function() {
      try { resolve(fn.call(ctx)); }
      catch (e) { reject(e); }
    });
  });
}

/**
 * Promise returning version
 * of `fastdom.write`
 *
 * @param  {Function} fn
 * @return {Promise}
 */
function write(fn, ctx) {
  return new Promise(function(resolve, reject) {
    fastdom.write(function() {
      try { resolve(fn.call(ctx)); }
      catch (e) { reject(e); }
    });
  });
}

/**
 * Promise returning version
 * of `fastdom.defer`
 *
 * @param  {Function} fn
 * @return {Promise}
 */
function defer(frame, fn, ctx) {

  // `frame` is optional
  if (typeof frame === 'function') {
    ctx = fn; fn = frame; frame = 1;
  }

  return new Promise(function(resolve, reject) {
    fastdom.defer(frame, function() {
      try { resolve(fn.call(ctx)); }
      catch (e) { reject(e); }
    });
  });
}

/**
 * Wrap a real `Promise` to
 * provide a chainable
 * FastDom API.
 *
 * @param {Promise} promise
 */
function WrappedPromise(promise) {
  this.promise = promise;
}

/**
 * Calls the real `then()` and wraps
 * the returned `Promise`.
 *
 * If we dont use the promise from `.then()`,
 * but instead create a new Promise, we break
 * the promise chain and exceptions don't
 * end up hitting `.catch()`.
 *
 * @param  {Function} fn
 * @return {WrappedPromise}
 */
WrappedPromise.prototype.then = function(fn) {
  var promise = this.promise.then(fn);
  return new WrappedPromise(promise);
};

/**
 * Wrap the real `.catch()` to make sure
 * the `WrappedPromise` is returned and
 * later chaining continues to work.
 *
 * @param  {Function} fn
 * @return {WrappedPromise}
 */
WrappedPromise.prototype.catch = function(fn) {
  this.promise.catch(fn);
  return this;
};

/**
 * Schedules a 'write' task once the
 * `WrappedPromise` has resolved.
 *
 * @param  {Function} fn
 * @param  {Object}   [ctx]
 * @return {WrappedPromise}
 */
WrappedPromise.prototype.write = function(fn, ctx) {
  return this.then(function(value) {
    return write(function() {
      return fn.call(ctx, value);
    });
  });
};

/**
 * Schedules a 'defer' task once the
 * `WrappedPromise` has resolved.
 *
 * @param  {Function} fn
 * @param  {Object}   [ctx]
 * @return {WrappedPromise}
 */
WrappedPromise.prototype.read = function(fn, ctx) {
  return this.then(function(value) {
    return read(function() {
      return fn.call(ctx, value);
    });
  });
};

/**
 * Schedules a 'defer' task once the
 * `WrappedPromise` has resolved.
 *
 * @param  {Function} fn
 * @param  {Object}   [ctx]
 * @return {WrappedPromise}
 */
WrappedPromise.prototype.defer = function(frame, fn, ctx) {

  // `frame` is optional
  if (typeof frame === 'function') {
    ctx = fn; fn = frame; frame = 1;
  }

  return this.then(function(value) {
    return defer(frame, function() {
      return fn.call(ctx, value);
    });
  });
};

});})((function(n,w){return typeof define=='function'&&define.amd?
define:typeof module=='object'?function(c){c(require,exports,module);}:
function(c){var m={exports:{}},r=function(n){return w[n];};
w[n]=c(r,m.exports,m)||m.exports;};})('fastdom-promise',this));