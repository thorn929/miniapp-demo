var utils = require('../util/util');
var constants = require('./constants');
var Session = require('./session');
var loginUrl = require('../config').getSessionKeyUrl;
var pageView = require('./pageView.js');
/***
 * @class
 * 表示登录过程中发生的异常
 */
var LoginError = (function () {
    function LoginError(type, message) {
        Error.call(this, message);
        this.type = type;
        this.message = message;
    }

    LoginError.prototype = new Error();
    LoginError.prototype.constructor = LoginError;

    return LoginError;
})();

/**
 * 微信登录，获取 code
 */
var getWxLoginResult = function getLoginCode(callback) {
    wx.login({
        success: function (loginResult) {
            wx.getSetting({
                success: function(res){
                    if (res.authSetting['scope.userInfo']) {
                        wx.getUserInfo({
                            withCredentials:true,
                            success: function (userResult) {
                                console.log(userResult)
                                callback(null, {
                                    code: loginResult.code,
                                    encryptedData: userResult.encryptedData,
                                    iv: userResult.iv,
                                    userInfo: userResult.userInfo,
                                });
                            },

                            fail: function (userError) {
                                var error = new LoginError(constants.ERR_WX_GET_USER_INFO, '获取微信用户信息失败，请检查网络状态');
                                error.detail = userError;
                                wx.showModal({
                                    title: '请打开用户信息授权',
                                    showCancel:false,
                                    content: '授权【用户信息】后，才能正常使用',
                                    success: function(res) {
                                        if (res.confirm) {
                                          pageView.init()
                                          let intercept=wx.getStorageSync(constants.WX_REQUEST_INTERCEPT)
                                          console.log('授权页面跳转拦截--01---：   '+intercept)
                                          if(intercept){
                                            console.log('授权页面跳转拦截-----01')
                                            return ;
                                          }
                                          wx.setStorageSync(constants.WX_REQUEST_INTERCEPT,1)
                                          let options=pageView.currPage.options
                                          let params=[]
                                          let str=''
                                          for(var k in options){
                                            params.push(k+'='+options[k])
                                          }
                                          if(params.length>0){
                                            str='?'+params.join('&')
                                          }
                                          if(pageView.currPage.route){
                                            let redirectUrl=encodeURIComponent('/'+pageView.currPage.route+str)
                                            wx.redirectTo({
                                              url: '/page/component/pages/authorize/authorize?redirect='+redirectUrl
                                            })
                                          }else{
                                            wx.navigateTo({
                                              url: '/page/component/pages/authorize/authorize'
                                            })
                                          }

                                        } else if (res.cancel) {
                                            console.log('用户点击取消')
                                        }
                                    }
                                })
                                callback(error, null);
                            },
                        });
                    }else {
                      pageView.init()
                      let intercept=wx.getStorageSync(constants.WX_REQUEST_INTERCEPT)
                      console.log('授权页面跳转拦截--02---：   '+intercept)
                      if(intercept){
                        console.log('授权页面跳转拦截  -----02')
                        return ;
                      }
                      wx.setStorageSync(constants.WX_REQUEST_INTERCEPT,1)
                      let options=pageView.currPage.options
                      let params=[]
                      let str=''
                      for(var k in options){
                        params.push(k+'='+options[k])
                      }
                      if(params.length>0){
                        str='?'+params.join('&')
                      }
                      if(pageView.currPage.route){
                        let redirectUrl=encodeURIComponent('/'+pageView.currPage.route+str)
                        wx.redirectTo({
                          url: '/page/component/pages/authorize/authorize?redirect='+redirectUrl
                        })
                      }else{
                        wx.navigateTo({
                          url: '/page/component/pages/authorize/authorize'
                        })
                      }
                    }
                }
            })

        },

        fail: function (loginError) {
            var error = new LoginError(constants.ERR_WX_LOGIN_FAILED, '微信登录失败，请检查网络状态');
            error.detail = loginError;
            callback(error, null);
        },
    });
};

var noop = function noop(err) {
    console.log(err)
};
var defaultOptions = {
    method: 'GET',
    success: noop,
    fail: noop,
    loginUrl:loginUrl,
};

/**
 * @method
 * 进行服务器登录，以获得登录会话
 *
 * @param {Object} options 登录配置
 * @param {string} options.loginUrl 登录使用的 URL，服务器应该在这个 URL 上处理登录请求
 * @param {string} [options.method] 请求使用的 HTTP 方法，默认为 "GET"
 * @param {Function} options.success(userInfo) 登录成功后的回调函数，参数 userInfo 微信用户信息
 * @param {Function} options.fail(error) 登录失败后的回调函数，参数 error 错误信息
 */
var login = function login(options) {
    options = utils.extend({}, defaultOptions, options);
    // console.log(options)
    if (!defaultOptions.loginUrl) {
        options.fail(new LoginError(constants.ERR_INVALID_PARAMS, '登录错误：缺少登录地址，请通过 setLoginUrl() 方法设置登录地址'));
        return;
    }

    var doLogin = () => getWxLoginResult(function (wxLoginError, wxLoginResult) {
        if (wxLoginError) {
            options.fail(wxLoginError);
            return;
        }
        var userInfo = wxLoginResult.userInfo;
        // 构造请求头，包含 code、encryptedData 和 iv
        var code = wxLoginResult.code;
        var encryptedData = wxLoginResult.encryptedData;
        var iv = wxLoginResult.iv;
        var header = {};
        // header[constants.WX_HEADER_IV] = iv;
        header=utils.extend({},header,options.header);
        options = utils.extend({}, {data:{code:code}}, options);
        console.log(options);
        // 请求服务器登录地址，获得会话信息
        wx.request({
            url: options.loginUrl,
            header: header,
            method: options.method,
            data: options.data,

            success: function (result) {
                var data = result.data;
                console.log(result)
                // 成功地响应会话信息
                if (data && data.code==100) {
                    if (data.data) {
                        data.data.userInfo = userInfo;
                        console.log('+++++++++++++=====userInfo==>>>>>start<<<<==+++++++++++++++');
                        console.log(data.data);
                        console.log('+++++++++++++=====userInfo===----end----=+++++++++++++++');
                        Session.set(data.data);
                        options.success(data.data);
                    } else {
                        var errorMessage = '登录失败(' + data.code + ')：' + (data.msg || '未知错误');
                        var noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, errorMessage);
                        options.fail(noSessionError);
                    }
                // 没有正确响应会话信息
                } else {
                    var errorMessage = '请求状态：'+result.statusCode+'；登录请求没有包含会话响应，请确保服务器处理 `' + options.loginUrl + '` 的时候正确使用了 SDK 输出登录结果'+data.code+'接口数据：'+data.msg;
                    var noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, errorMessage);
                    console.log(noSessionError);
                    options.fail(noSessionError);
                }
            },

            // 响应错误 
            fail: function (loginResponseError) {
                var error = new LoginError(constants.ERR_LOGIN_FAILED, '登录失败，可能是网络错误或者服务器发生异常');
                options.fail(error);
            }
        });
    });
    if(options.bindMobile){
        Session.clear();
    }
    var session = Session.get();
    if (session) {
        wx.checkSession({
            success: function () {
                options.success(session);
            },
            fail: function () {
                Session.clear();
                doLogin();
            },
        });
    } else {
        doLogin();
    }
};

var setLoginUrl = function (loginUrl) {
    defaultOptions.loginUrl = loginUrl;
};
module.exports = {
    LoginError: LoginError,
    login: login,
    setLoginUrl: setLoginUrl,
};