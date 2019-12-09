var untils = require('../util/util.js');
var config = require('../config');
var constants = require('./constants');
var Session = require('./session');
// var loginLib = require('./login');
/***
 * @class
 * 表示请求过程中发生的异常
 */
var RequestError = (function() {
  function RequestError(type, message) {
    Error.call(this, message);
    this.type = type;
    this.message = message;
  }

  RequestError.prototype = new Error();
  RequestError.prototype.constructor = RequestError;

  return RequestError;
})();
var handle = {
  request: function(options) {
    var requireLogin = options.login;
    var hideToast = options.hideToast;
    var success = options.success || noop;
    var fail = options.fail || noop;
    var complete = options.complete || noop;
    var originHeader = options.header || {};
    // 成功回调
    var callSuccess = function() {
      if (!hideToast && wx.hideLoading) {
        wx.hideLoading()
      }
      success.apply(null, arguments);
      complete.apply(null, arguments);
    };

    // 失败回调
    var callFail = function(error) {
      if (!hideToast && wx.hideLoading) {
        wx.hideLoading()
      }
      console.log('--fail--');
      fail.call(null, error);
      complete.call(null, error);
    };
    if (!hideToast && wx.showLoading) {
      wx.showLoading({
        title: '',
      })
    }
    // 是否已经进行过重试
    var hasRetried = false;

    if (requireLogin) {
      doRequestWithLogin();
    } else {
      doRequest();
    }

    // 登录后再请求
    function doRequestWithLogin() {
      loginLib.setLoginUrl(config.getSessionKeyUrl);
      loginLib.login({
        success: doRequest,
        fail: callFail
      });
    }

    function doRequest() {
      var authHeader = buildAuthHeader(Session.get(), options);
      wx.request(untils.extend({}, options, {
        header: untils.extend({}, originHeader, authHeader),
        success: function(response) {
          // console.log(response)
          var data = response.data;
          // console.log(data)
          if (data && data.code && data.code == 108) {
            // 清除登录态
            Session.clear();
            var error, message;
            // 如果是登录态无效，并且还没重试过，会尝试登录后刷新凭据重新请求
            if (!hasRetried) {
              hasRetried = true;
              doRequestWithLogin();
              return;
            }
            message = '登录态已过期';
            error = new RequestError(constants.ERR_INVALID_SESSION, message);
            callFail(error);
            return;
          }
          callSuccess.apply(null, arguments);
        },
        fail: callFail,
        complete: noop,
      }));
    }

  },
  setStorage: function() {
    var key, data, complete, fail;
    if (arguments.length === 1 && untils.isObject(arguments[0]) && !untils.isArray(arguments[0])) { //异步
      key = arguments[0].key;
      data = arguments[0].data;
      complete = arguments[0].complete;
      fail = arguments[0].fail;
      wx.setStorage({
        key: key,
        data: data,
        complete: function(data) {
          if (untils.isFunction(complete)) {
            complete(data);
          }
        }
      });
    } else { //同步
      key = arguments[0];
      data = arguments[1];
      try {
        return wx.setStorageSync(key, data);
      } catch (e) {
        console.error(e);
      }
    }
  },
  getStorage: function() {
    var key, complete, fail;
    if (arguments.length === 2) { //异步
      key = arguments[0];
      complete = arguments[1];
      wx.getStorage({
        key: key,
        complete: function(data) {
          if (untils.isFunction(complete)) {
            complete(data);
          }
        }
      });
    } else { //同步
      key = arguments[0];
      try {
        return wx.getStorageSync(key);
      } catch (e) {
        console.error(e);
      }
    }
  },
  clearStorage: function() {
    try {
      return wx.clearStorageSync();
    } catch (e) {
      console.error(e);
    }
  },
  showMsg: function(msg, title, color, callback) {
    wx.showModal({
      title: title ? title : '提示',
      content: msg,
      showCancel: false,
      confirmColor: color ? color : '#ED4949',
      success: function(res) {
        callback && callback(res)
      }
    })
  }
};


module.exports = handle;