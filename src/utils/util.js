import wepy from 'wepy'
import api from './api'
var qiniuUploader = require('./qiniuUploader')
var getNewSession = function () {
	// 在确定本地没有 session 或者 session 失效的时候使用
	return new Promise(function (resolve, reject) {
		console.log('调用getNewSession')
		wx.login({
			success: function (res) {
				if (res.code) {
					wx.request({
						url: api['login'],
						data: {
							code: res.code
						},
						method: 'GET',
						success: function (res) {
							if (res.statusCode == 200) {
								var session = res.data.session
								wx.setStorageSync('session', session)
								wx.hideLoading()
								console.log('成功获取 session ', session)
								resolve(session)
							} else {
								wx.showToast({
									title: '登录失败',
								})
							}
						}
					})
				} else {
					reject(new Error('获取用户登录态失败！' + res.errMsg))
					wx.showToast({
						title: '登录失败',
					})
				}
			}
		})
	})
}

var getSession = function () {
	return new Promise(function (resolve, reject) {
		var session = wx.getStorageSync('session')
		if (session) {
			console.log('有 session')
			checkSession().then(function (result) {
				console.log('check result', result)
				if (result) {
					resolve(session)
				} else {
					console.log('session 过期')
					getNewSession().then(function (session) {
						resolve(session)
					})
				}
			})
		} else {
			console.log('没有 session')
			getNewSession().then(function (session) {
				resolve(session)
			})
		}
	})
}

var checkSession = function () {
	// 用来检查本地的 session 是否有效
	return new Promise(function (resolve, reject) {
		var session = wx.getStorageSync('session')
		var checked = wx.getStorageSync('checked')
		if (session) {
			if (checked) {
				var result = true
				resolve(result)
			} else {
				wx.request({
					url: api['login'],
					data: {
						session: session,
					},
					method: 'POST',
					success: function (res) {
						if (res.data.result) {
							// 如果检查结果正确，就将结果保存起来，本次小程序生命周期中都不用再到服务器检查了
							wx.setStorage({
								key: 'checked',
								data: res.data.result,
							})
						}
						resolve(res.data.result)
					}
				})
			}
		}
	})
}

var loadMyUserInfo = function (data) {
	return new Promise(function (resolve, reject) {
		console.log('调用 loadMyUserInfo')
		getSession().then(function (session) {
			// 获取个人除了 openid 以外的全部信息
			wx.request({
				url: api['users/me'],
				data: { session },
				method: 'GET',
				success: function (res) {
					if (res.statusCode == 200 && res.data.myUserInfo) {
						var myUserInfo = res.data.myUserInfo
						const level = myUserInfo.level
						switch (true) {
						case level > 0 && level <= 5:
							myUserInfo.level_detail = '合规青铜'
							break
						case level > 5 && level <= 10:
							myUserInfo.level_detail = '合规白银'
							break
						case level > 10 && level <= 15:
							myUserInfo.level_detail = '合规黄金'
							break
						case level > 15:
							myUserInfo.level_detail = '合规王者'
							break
						}
						wepy.$instance.globalData.myUserInfo = myUserInfo
						console.log('修改后的全局数据', wepy.$instance.globalData)
						resolve(myUserInfo)
					} else {
						resolve()
					}
				},
				fail: function (error) {
					console.log(error)
					reject(error)
				}
			})
		}).catch(error => {
			console.log(error)
		})
	})
}

var getMyUserInfo = function () {
	console.log(wepy.$instance.globalData)
	return new Promise(function (resolve, reject) {
		if (wepy.$instance.globalData.myUserInfo) {
			resolve(wepy.$instance.globalData.myUserInfo)
		} else {
			loadMyUserInfo().then(function (myUserInfo) {
				resolve(myUserInfo)
			})
		}
	})
}

var updateMyUserInfo = function (myUserInfo) {
	return new Promise(function (resolve, reject) {
		console.log('调用updateMyUserInfo')
		getSession().then(function (session) {
			wx.request({
				url: api['users/me'],
				data: { session },
				method: 'PUT',
				success: function (res) {
					if (res.statusCode == 201) {
						wx.hideLoading()
						wepy.$instance.globalData.myUserInfo = myUserInfo
						console.log('修改后的全局数据', wepy.$instance.globalData)
						resolve(myUserInfo)
					} else {
						wx.showToast({
							title: '上传失败',
						})
					}
				}
			})
		})
	})
}

var bindUser = function (name, avatarUrl) {
	return new Promise(function (resolve, reject) {
		getSession().then(function (session) {
			wx.request({
				url: api['users/bind'],
				data: {
					session,
					name,
					avatarUrl
				},
				method: 'POST',
				success: function (res) {
					resolve(res)
				}
			})
		})
	})
}

const uploadQiNiu = (filePath) => {
	return new Promise((resolve) => {
		console.log('file', filePath)
		const options = {
			region: 'SCN', // 此为华南地区代码
			domain: 'oub2bvxd7.bkt.clouddn.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
			key: `userAudio${Date.now()}.mp3`, // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
			uptokenURL: api['uptoken'], // 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "[yourTokenString]"}
		}
		qiniuUploader.upload(filePath, (res) => resolve(res), (err) => console.log(err), options)
	})
}

const getDateDiff = (dateTimeStamp) => {
	var result
	var minute = 1000 * 60
	var hour = minute * 60
	var day = hour * 24
	var month = day * 30
	var now = new Date().getTime()
	var diffValue = now - dateTimeStamp
	if (diffValue < 0) {
		return
	}
	var monthC = diffValue / month
	var weekC = diffValue / (7 * day)
	var dayC = diffValue / day
	var hourC = diffValue / hour
	var minC = diffValue / minute
	if (monthC >= 1) {
		if (monthC <= 12)		{
			result = '' + parseInt(monthC) + '月前'
		} else {
			result = '' + parseInt(monthC / 12) + '年前'
		}
	} else if (weekC >= 1) {
		result = '' + parseInt(weekC) + '周前'
	} else if (dayC >= 1) {
		result = '' + parseInt(dayC) + '天前'
	} else if (hourC >= 1) {
		result = '' + parseInt(hourC) + '小时前'
	} else if (minC >= 1) {
		result = '' + parseInt(minC) + '分钟前'
	} else {
		result = '刚刚'
	}
	return result
}

module.exports = {
	getNewSession,
	getSession,
	checkSession,
	getMyUserInfo,
	loadMyUserInfo,
	updateMyUserInfo,
	bindUser,
	uploadQiNiu,
	getDateDiff
}
