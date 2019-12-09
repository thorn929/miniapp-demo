import InterceptorManager from './interceptor.js';
import dispatchRequest from './dispatchRequest.js';

function httpRequest(){
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

httpRequest.prototype.request = function request(config){
  // 挂载拦截器
  let chain = [dispatchRequest,undefined]
  let promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor){
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  })

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor){
    chain.push(interceptor.fulfilled, interceptor.rejected);
  })

  while (chain.length){
    promise = promise.then(chain.shift(),chain.shift())
  }
  return promise
}

httpRequest.prototype.get = function(url,config){
  return this.request(Object.assign({
    method:'GET',
    url:url
  },config || {}))

}

httpRequest.prototype.post = function(url,data,config){

  return this.request(Object.assign({
    method:'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    url:url,
    data:data || {}
  },config || {}))

}

function createdInstance(){
  const context = new httpRequest();
  const instance = context;
  return instance
}

const $http = createdInstance();

export default $http
