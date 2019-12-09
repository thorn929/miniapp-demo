/**
 * Created by zcy on 2019/10/23
 */
let wxService = require('../common/common.js');
let utils = require('../util/util.js');
const mobileUrl = require('../config').mobileUrl
let handle = {
    getMobile:function (args) {
        wxService.request(utils.extend({}, args, {url: mobileUrl,method:'POST',header:{'content-type':'application/x-www-form-urlencoded'}}));
    },
}
module.exports=handle;