const index = require('./index/index')
const sitemap = require('./sitemap/sitemap')
const error = require('./error/error')

module.exports = app => {
	app.use('/', index)
	app.use('/sitemap.xml', sitemap)
	app.use('*', error)
}