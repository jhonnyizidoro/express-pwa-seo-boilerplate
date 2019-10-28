const request = require('request')

const postExample = data => {
	return new Promise((resolve, reject) => {
		request({
			uri: ENDPOINT,
			method: 'POST',
			form: data,
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		}, (error, response) => {
			if (!error) {
				resolve(response.body)
			} else {
				reject(error)
			}
		})
	})
}

module.exports = {
	postExample,
}