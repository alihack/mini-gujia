const roots = {
// prod: 'https://love.yylhealth.com/',
	dev: 'http://172.17.22.158:3338/',
	test: 'http://118.25.21.169:3338/'
}
const apis = [
	'login',
	'users',
	'users/sign',
	'users/me',
	'users/bind',
	'users/level',
	'users/mistakes',
	'questions',
	'categories',
	'practices',
	'uptoken',
	'comments',
	'collections'
]

const env = 'test' // dev: 本地测试服务器， prod：线上服务器, test：测试服务器
const root = roots[env]
const api = {}
apis.forEach(ele => {
	api[ele] = root + ele
})

export default api
