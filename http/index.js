import $http from './http.js';
$http.interceptors.request.use(
  async function onFulfilled(config){
    wx.showLoading({
      title: '',
    })
    return config;
  },
  function onRejected(config){
    console.log('config拦截器失败了')
  }
)

$http.interceptors.response.use(
  function onFulfilled(response){
           wx.hideLoading()
      const code = +response.data.code
      switch (code){
          case 401:
          case 403:
              wx.showToast({
                  title: response.data.msg,
                  icon: 'none',
                  duration: 2000
              })
          default:
            return response;
      }
  },
  function onRejected(reason){
    console.log('我是拦截器失败')
      wx.hideLoading()
  }
)

export default $http;