const index = require('./index/index')
const error = require('./error/error')

module.exports = app => {
	app.use('/', index)
	app.use('*', error)
}