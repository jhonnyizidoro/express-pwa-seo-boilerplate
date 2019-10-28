const express = require('express')
const router = express.Router()
const sitemap = require('sitemap')

router.get('/', (req, res) => {
	res.header('Content-Type', 'application/xml')
	const xml = sitemap.createSitemap({
		hostname: host,
		cacheTime: 600000,
		urls: [
			{
				url: '/',
				changefreq: 'monthly',
				priority: 1
			}
		]
	}).toXML()
	res.send(xml)
})

module.exports = router