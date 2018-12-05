/* eslint-disable yoda */
import wepy from 'wepy'
import api from './api'
// import QQMapWX from './qqmap-wx-jssdk.js'

const getUserId = (isForced) => {
	return new Promise(async resolve => {
		console.log('调用getUserId方法')
		const uid = wx.getStorageSync('uid')
		// 有uid则不重新获取
		if (uid && !isForced) {
			console.log('有uid不重新获取')
			resolve(uid)
			return
		}
		wx.login({
			success: async (res) => {
				if (res.code) {
					console.log(res)
					const {data} = await wepy.request({
						url: api['getUserId'],
						data: {
							code: res.code
						}
					})
					if (!data.uid) {
						resolve('')
					} else {
						wx.setStorageSync('uid', data.uid)
						resolve(data.uid)
					}
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
		if (!uid) {
			console.log('没有uid不重新获取UserInfo')
			resolve()
			return
		}
		const {data: {userInfo}} = await wepy.request({
			url: api['getUserInfo'],
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
		const locationInfo = wx.getStorageSync('locationInfo')
		// 有locationInfo则不重新获取
		if (locationInfo) {
			console.log('有locationInfo不重新获取')
			resolve()
			return
		}
		// 实例化API核心类
		// const qqmapsdk = new QQMapWX({
		// 	key: 'KUBBZ-HYIKF-II2J3-NYSEA-IY3ZQ-KTBP3'
		// })
		// wx.getLocation({
		// 	type: 'gcj02',
		// 	success: res => {
		// 		let locationInfo = {}
		// 		qqmapsdk.reverseGeocoder({
		// 			location: {
		// 				latitude: res.latitude,
		// 				longitude: res.longitude
		// 			},
		// 			success: ({result: {ad_info}}) => {
		// 				locationInfo.name = ad_info.city.slice(0, ad_info.city.length - 1)
		// 				locationInfo.code = ad_info.city_code.slice(3)
		// 			},
		// 			fail: function(res) {
		// 				console.log(res)
		// 			},
		// 			complete: function(res) {
		// 				wx.setStorageSync('locationInfo', locationInfo)
		// 				resolve()
		// 			}
		// 		})
		// 	}
		// })
		wx.setStorageSync('locationInfo', {name: '厦门', code: '350200'})
		resolve()
	})
}

const dataController = (ele) => {
	return new Promise(async resolve => {
		console.log('调用dataController方法')
		// 2-1-2  => 2室1厅2卫
		const typeArr = ele.house_type.split('-')
		ele.house_type = typeArr[0] + '室' + typeArr[1] + '厅' + typeArr[2] + '卫'
		// 75.00 => 75  71.50 => 71.5
		ele.total_price = parseFloat(ele.total_price)
		ele.unit_price = parseFloat(ele.unit_price)
		ele.acreage = parseFloat(ele.acreage)
		// 计算估值范围
		ele.price_range = parseInt(ele.total_price * 0.96) + '~' + parseInt(ele.total_price * 1.05) + '万'
		// 房源分析
		let sourceAnalyze = [{}, {}, {}]
			// 面积
		const acreage = parseFloat(ele.acreage)
		sourceAnalyze[0].txt1 = ele.house_type
		sourceAnalyze[0].txt2 = `${ele.acreage}m`
		switch (true) {
			case 0 <= acreage && acreage <= 49:
				sourceAnalyze[0].content = '该房屋适合单身人士，装修居住成本较低，为缺乏资金的年轻人的首选。'
				break
			case 50 <= acreage && acreage <= 89:
				sourceAnalyze[0].content = '作为过渡型的小户型，适合资金不足的首次置业人群以及刚需'
				break
			case 90 <= acreage && acreage <= 139:
				sourceAnalyze[0].content = '该户型属于上面上的主流户型，作为市场刚需产品，保值能力较强。'
				break
			case 140 <= acreage:
				sourceAnalyze[0].content = '该房屋属于改善类大户型，居住惬意，适合资金充裕的人群。'
				break
		}
		const storeyNum = parseFloat(ele.storey.slice(0, ele.storey.indexOf('层')))
		sourceAnalyze[1].txt1 = '楼层'
		sourceAnalyze[1].txt2 = ele.storey
		switch (true) {
			case 1 <= storeyNum && storeyNum <= 4:
				sourceAnalyze[1].content = '低楼层出行更方便，适合有老人、儿童的家庭。但通风、采光较差，噪音较大且易受潮。'
				break
			case 5 <= storeyNum && storeyNum <= 8:
				sourceAnalyze[1].content = '黄金楼层，兼顾出行与采光通风，居住品质较高，视野较好。'
				break
			case 9 <= storeyNum && storeyNum <= 11:
				sourceAnalyze[1].content = '俗称扬灰层，空气中灰尘含量较高，但视野通风良好。'
				break
			case 12 <= storeyNum && storeyNum <= 18:
				sourceAnalyze[1].content = '采光优秀，通风、视野良好，居住质量较高，但老人出行或有不便。'
				break
			case 19 <= storeyNum:
				sourceAnalyze[1].content = '视野绝佳，空气清新，但风力较大，或许存在冬冷夏热的可能。'
				break
		}
		sourceAnalyze[2].txt1 = '朝向'
		sourceAnalyze[2].txt2 = ele.orientation
		switch (ele.orientation) {
			case '南':
				sourceAnalyze[2].content = '采光充足，通风好，冬暖夏凉，但是相对均价较高。'
				break
			case '东南':
				sourceAnalyze[2].content = '采光充足，冬季暖和，但通风略显不足，所以容易潮湿。'
				break
			case '东':
				sourceAnalyze[2].content = '上午阳光充足，采光较好，通风相对较差。'
				break
			case '西南':
				sourceAnalyze[2].content = '除了早晨之外，其余采光时间较好，但四季通风都较差，且有西晒，冬季偏冷。'
				break
			case '西':
				sourceAnalyze[2].content = '通风较好，但夏季西晒严重。'
				break
			case '东北':
				sourceAnalyze[2].content = '早晨会有阳光，冬季会有些寒冷。'
				break
			case '西北':
				sourceAnalyze[2].content = '均价比较低，但需要忍受西晒，大部分的房间都没有阳光的照射。'
				break
			case '北':
				sourceAnalyze[2].content = '夏季凉爽，在采光上具有劣势，且冬季阴冷。'
				break
			case '南北':
				sourceAnalyze[2].content = '冬暖夏凉，采光充足，通风良好，十分宜居。'
				break
			case '东西':
				sourceAnalyze[2].content = '早晚阳光较为充足，但各方面均不如南北朝向的房子。'
				break
		}
		ele.sourceAnalyze = sourceAnalyze
		// 环比
		if (ele.ratio) {
			ele.ratioIconSrc = ele.ratio.indexOf('跌') != -1 ? '../images/decline.png' : '../images/rise.png'
		}
		resolve(ele)
	})
}

module.exports = {
	getUserId,
	getUserInfo,
	getLocation,
	dataController
}
