import wepy from 'wepy'
import api from './api'

const login = () => {
	return new Promise(async resolve => {
		console.log('调用login方法')
		wx.login({
			success (res) {
				if (res.code) {
					console.log(res)
					const {session} = wepy.request({
						url: api['login'],
						data: {
							code: res.code
						}
					})
					console.log(session)
					wx.setStorageSync('session', session)
					resolve()
				} else {
					console.log('登录失败！' + res.errMsg)
				}
			}
		})
	})
}

const getMyInfo = () => {
	return new Promise(async resolve => {
		console.log('调用getMyInfo方法')
		const res = wepy.request({
			url: api['users/me']
		})
		resolve()
		// 没有用户信息则跳授权页面
		if (!res) wepy.redirectTo({url: 'loginByAuthor'})
	})
}
module.exports = {
	login,
	getMyInfo,
}
