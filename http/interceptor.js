function InterceptorManager() {
  this.handlers = [];
}

InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

InterceptorManager.prototype.forEach = function forEach(fn) {
    function forEachHandler(h) {
      if (h !== null) {
        fn(h)
      }
    }
    for (var i = 0, l = this.handlers.length; i < l; i++) {
      forEachHandler(this.handlers[i])
    }

};
export default InterceptorManager;