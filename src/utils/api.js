const roots = {
	prod: 'https://love.yylhealth.com/',
	test: 'http://118.25.21.169:3338/',
	dev: 'https://hd-api.dev.xiaoyu.com/index.php/fngj/'
}
const apis = [
	'login/getUserId',
	'login/saveUser',
	'user/getUserInfo',
	'user/getEvaluationHistory',
	'user/getCity',
	'user/saveCity',
	'index/getCommunityList',
	'index/getHousePrice',
	'index/addHouseInfo',
	'index/getCityList'
]

const env = 'dev' // dev: 本地测试服务器， prod：线上服务器, test：测试服务器
const root = roots[env]
const api = {}
apis.forEach(ele => {
	api[ele] = root + ele
})

export default api
