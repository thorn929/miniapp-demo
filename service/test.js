import $http from '../http/index'

const handle = {
    test(params) {
        return $http.get('https://api.weixin.qq.com/sns/jscode2session?appid=111&se_code')
    }
}
export default handle