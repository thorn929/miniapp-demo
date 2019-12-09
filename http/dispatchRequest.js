let getBaseConfig =require( './baseOptions.js');
let utils =require('../util/util.js');

function combination(config){

  let combConfig;
  if(config.method === 'GET'){

    combConfig = Object.assign(getBaseConfig(),config.params);

    delete config.params;
    // combConfig = cryptionUtils.transformDataByMD5(combConfig,"GET");
    let url = utils.createdQueryWidthUrl(combConfig,config.url);
    combConfig = Object.assign(config,{url:url})
  } else if (config.method === 'POST') {
    let data = Object.assign(getBaseConfig(),config.data)
    combConfig = Object.assign(config,{data:data})
  }else{
    combConfig = config;
  }
  return combConfig;
}


/**
 * 向服务器发送请求
 * @param {object} config 发起请求的数据
 * @returns {Promise}
 */

module.exports = function dispatchRequest(config){
  let combconfig = combination(config);
  return new Promise((resolve,reject)=>{
    combconfig = Object.assign(combconfig,{
      success:function(res){
        resolve(res);
      },
      fail:function(res){
        reject(res);
      },
      complete:function(res){
        reject(res);
      }
    });
    wx.request(combconfig)

  }).then(function onAdapterResolution(response){
    return response
  },function onAdapterRejection(reason){
    return Promise.reject(reason);
  })

}