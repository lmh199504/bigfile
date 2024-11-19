const {
	default: axios
} = require("axios");

// const axios = require(axios());

const request = axios.create()

let time = 0
const fn = async () => {
	try{
		await request({
			url: "http://wh-mes.meiqicloud.com/mes/account/login/token",
			method: 'post',
			data: {
				"username": "ADMIN",
				"password": "123456"
			}
		})
		console.log('成功了')
	}catch(e){
		//TODO handle the exception
		time++;
		console.log('失败了', time)
		fn()
	}
	
}

fn()