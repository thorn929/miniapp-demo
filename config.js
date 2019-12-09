/**
 * 小程序配置文件
 */
let host
let server_judge = "test"; //公共配置，正式{server}，测试{test}
switch (server_judge){
	case 'dev':
		host = "https://devapi.95vintage.com";
		break
	case 'server':
		host = "https://api.95vintage.com";
		break
}

const config = {
	host
}
export default config