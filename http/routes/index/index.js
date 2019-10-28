const express = require('express')
const router = express.Router()
const {postExample} = require('../../services/services')

router.get('/', (req, res) => {
	const seo = {
		title: 'Home | Wellcome',
		description: 'The best SEO optimized Progressive Web App!',
		keywords: ['seo', 'optimized', 'pwa', 'progressive', 'web', 'app', 'home', 'pug', 'express', 'gulp', 'node', 'sass'],
	}
	res.render('index', {
		seo
	})
})

router.post('/', (req, res) => {
	const postObject = {
		name: 'John Doe',
		password: '123456'
	}
	postExample(postObject).then(response => {
		console.log(response)
		res.redirect('/')
	}).catch(error => {
		console.log(error)
		res.redirect('/')
	})
})

module.exports = router