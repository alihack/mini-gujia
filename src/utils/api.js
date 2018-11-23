const roots = {
	prod: 'https://love.yylhealth.com/',
	test: 'http://118.25.21.169:3338/',
	dev: 'https://hd-api.dev.xiaoyu.com/index.php/wxapp/fngj/index/'
}
const apis = [
	'getUserId',
	'saveUser',
	'getUserInfo',
	'getEvaluationHistory',
	'getCommunityList',
	'getHousePrice',
	'addHouseInfo',
	'sendCode',
	'mobileLogin',
	'addUserIntention'
]

const env = 'dev' // dev: 本地测试服务器， prod：线上服务器, test：测试服务器
const root = roots[env]
const api = {}
apis.forEach(ele => {
	api[ele] = root + ele
})

export default api
