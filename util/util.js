/**
 * Created by zcy on 2019/10/23
 */
function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
      return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
  }).join(':')
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
      longitude = parseFloat(longitude)
      latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
      longitude: longitude.toString().split('.'),
      latitude: latitude.toString().split('.')
  }
}
/**
* 拓展对象
*/
function extend(target) {
  var sources = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < sources.length; i += 1) {
      var source = sources[i];
      for (var key in source) {
          if (source.hasOwnProperty(key)) {
              target[key] = source[key];
          }
      }
  }

  return target;
};
function isObject (obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !! obj;
}
var searchAction =function (search,name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = search.match(reg);
  if (r != null) return decodeURI(r[2]);
  return null;
}
function jumpUrlAction(urls){
  var urls='https://www.95vintage.com/yi23/Home/Others/jumpNativePage.html?jumpNativeType=47&jumpNativeId=kf_9515_1512620101745';
  var search= urls.split('?')[1],hasJump=urls.indexOf('jumpNativeType')!=-1;
  if(hasJump){

  }else{

  }
}

module.exports = {
  formatTime: formatTime,
  formatLocation: formatLocation,
  extend:extend,
  isObject:isObject
}
