// 户型
const houseTypeArry = [
	['1室', '2室', '3室', '4室', '5室', '6室', '7室', '8室', '9室'],
	['0厅', '1厅', '2厅', '3厅', '4厅', '5厅', '6厅', '7厅', '8厅'],
	['0卫', '1卫', '2卫', '3卫', '4卫', '5卫', '6卫', '7卫', '8卫'],
]

// 朝向
const orientationArry = ['东', '南', '西', '北', '东南', '西南', '东北', '西北', '南北', '东西']

// 楼层
const storeyNum = []
const storeyAll = []
for (let i = 1; i <= 60; i++) {
	storeyNum.push(`${i}层`)
	storeyAll.push(`共${i}层`)
}
const storeyArry = [storeyNum, storeyAll]
module.exports = {
	houseTypeArry,
	orientationArry,
	storeyArry
}
