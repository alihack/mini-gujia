import wepy from 'wepy'
import api from './api'
import QQMapWX from './qqmap-wx-jssdk.js'

const getUserId = () => {
	return new Promise(async resolve => {
		console.log('调用getUserId方法')
		const uid = wx.getStorageSync('uid')
		// 有uid则不重新获取
		if (uid) {
			resolve()
			return
		}
		wx.login({
			success: async (res) => {
				if (res.code) {
					console.log(res)
					const {data} = await wepy.request({
						url: api['login/getUserId'],
						data: {
							code: res.code
						}
					})
					if (!data.uid) wepy.redirectTo({url: 'loginByAuthor'})
					console.log(data)
					wx.setStorageSync('uid', data.uid)
					resolve()
				} else {
					console.log('登录失败！' + res.errMsg)
				}
			}
		})
	})
}

const getUserInfo = () => {
	return new Promise(async resolve => {
		console.log('调用getUserInfo方法')
		const uid = wx.getStorageSync('uid')
		// 有myUserInfo则不重新获取
		if (wepy.$instance.globalData.myUserInfo || !uid) {
			resolve()
			return
		}
		const {data: {userInfo}} = await wepy.request({
			url: api['user/getUserInfo'],
			data: {
				uid
			}
		})
		wepy.$instance.globalData.myUserInfo = userInfo
		console.log('修改后的全局数据', wepy.$instance.globalData)
		resolve()
	})
}

const getLocation = () => {
	return new Promise(async resolve => {
		console.log('调用getLocation方法')
		const addressInfo = wx.getStorageSync('addressInfo')
		// 有uid则不重新获取
		if (addressInfo) {
			resolve()
			return
		}
		// 实例化API核心类
		const qqmapsdk = new QQMapWX({
			key: 'KUBBZ-HYIKF-II2J3-NYSEA-IY3ZQ-KTBP3'
		})
		wx.getLocation({
			type: 'gcj02',
			success: res => {
				console.log(res)
				let addressInfo = {}
				qqmapsdk.reverseGeocoder({
					location: {
						latitude: res.latitude,
						longitude: res.longitude
					},
					success: ({result: {ad_info}}) => {
						addressInfo.city = ad_info.city.slice(0, ad_info.city.length - 1)
						addressInfo.adcode = ad_info.adcode
					},
					fail: function(res) {
						console.log(res)
					},
					complete: function(res) {
						wx.setStorageSync('addressInfo', addressInfo)
						resolve(addressInfo)
					}
				})
			}
		})
	})
}

module.exports = {
	getUserId,
	getUserInfo,
	getLocation,
}
