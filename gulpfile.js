//Gulp
const {src, dest, series, task, watch, parallel} = require('gulp')
//Browsersync
const browserSync = require('browser-sync').create()
//Clean
const gulpClean = require('gulp-clean')
//Pump
const pump = require('pump')
//File system
const fs = require('fs')
//Sass tools
const sassCompiler = require('gulp-sass')
//Favicons
const faviconGenerator = require('gulp-favicons')
//Environment variables
const env = require('./env')
//JS tools
const jsBrowserify = require('browserify')
const jsBabelify = require('babelify')
const jsSource = require('vinyl-source-stream')
const jsBuffer = require('vinyl-buffer')
const jsUglify = require('gulp-uglify')
const jsSourcemaps = require('gulp-sourcemaps')
const jsCache = require('gulp-fs-cache')
//Image tools
const imagemin = require('gulp-imagemin')
const imageminPngquant = require('imagemin-pngquant')
const imageminZopfli = require('imagemin-zopfli')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminGiflossy = require('imagemin-giflossy')
const imageminSvgo = require('imagemin-svgo')
const imageminCache = require('gulp-cache')

//Clear public folder
task(clean = () => {
	return pump([
		src('public', {
			allowEmpty: true
		}),
		gulpClean({
			force: true,
		})
	])
})

//Copy all dirs under assets, except sass, js, images and favicon
const dirsToCopy = [
	'assets/**/*',
	'!assets/{sass,js,images,favicon}/**/*',
	'!assets/{sass,js,images,favicon}'
]
task(copy = () => {
	return pump([
		src(dirsToCopy, {
			base: 'assets'
		}),
		dest('public')
	])
})


//Sass into CSS (minified)
task(sass = () => {
	return pump([
		src('assets/sass/app.sass'),
		sassCompiler({
			outputStyle: 'compressed',
			includePaths: ['node_modules']
		}).on('error', error => {
			let errorFile = error.file.split('/')
			errorFile = errorFile[errorFile.length - 1]
			console.log("\x1b[41m", "\x1b[30m", `Erro na linha ${error.line} do arquivo ${errorFile} na loja ${projectDir}.\nErro: ${error.messageOriginal}`, "\x1b[0m")
		}),
		dest('public/css'),
		browserSync.stream()
	])
})

//Convert and uglify modular JS to regular JS
task(js = done => {
	if (!fs.existsSync('assets/js/app.js')) {
		return done()
	}
	const jsFsCache = jsCache('public/js/tmp')
	return pump([
		jsBrowserify({
			entries: 'assets/js/app.js',
			debug: true,
			read: false,
			paths: [
				'./',
			],
		}).transform(jsBabelify, {
			presets: ['@babel/env']
		}).bundle().on('error', error => console.log('\x1b[41m%s\x1b[0m', error.stack)),
		jsSource('app.js'),
		jsBuffer(),
		jsSourcemaps.init({
			loadMaps: true
		}),
		jsFsCache,
		jsUglify(),
		jsFsCache.restore,
		jsSourcemaps.write('./tmp'),
		dest('public/js')
	])
})

//Minify the images
task(img = () => {
	return pump([
		src('assets/images/**/*'),
		imageminCache(
			imagemin([
				imageminPngquant({
					speed: 1,
					quality: [0.3, 0.5]
				}),
				imageminZopfli({
					more: true
				}),
				imageminGiflossy({
					optimizationLevel: 3,
					optimize: 3,
					lossy: 2
				}),
				imagemin.jpegtran({
					progressive: true
				}),
				imageminMozjpeg({
					quality: 90
				}),
				imageminSvgo({
					plugins: [
						{convertStyleToAttrs: false},
						{cleanupIDs: false},
						//{ removeUselessDefs: false },
						{removeTitle: true},
						{removeDesc: true},
					]
				})
			])
		),
		dest('public/images')
	])
})

//Generate the favicons and manifest
task(favicon = () => {
	return pump([
		src('assets/favicon/favicon.png'),
		faviconGenerator({
			path: '/favicon',
			appName: `App ${env.APP_NAME} (Installation)`,
			appShortName: env.APP_NAME,
			appDescription: 'A Progressive Web App made with Express, Node, Gulp, Sass and more!',
			dir: 'auto',
			lang: 'pt-BR',
			background: '#F5F5F5',
			theme_color: '#F5F5F5',
			display: 'standalone',
			orientation: 'any',
			scope: '/',
			start_url: '/',
			logging: false,
			loadManifestWithCredentials: false,
			icons: {
				android: true,
				appleIcon: false,
				appleStartup: false,
				coast: false,
				favicons: true,
				firefox: false,
				windows: false,
				yandex: false,
			}
		}),
		dest('public/favicon')
	])
})

//Watch the files
task(server = () => {
	browserSync.init({
		proxy: 'localhost',
		logLevel: 'silent',
	})
	watch('assets/sass/**/*.sass', sass)
	watch('assets/images/**/*', series(img, reload))
	watch('assets/js/**/*.js', series(js, reload))
	watch('assets/favicon/favicon.png', series(favicon, reload))
	watch('views/**/*.pug', reload)
	watch(dirsToCopy, series(copy, reload))
})

//Reload the browser
task(reload = (done) => {
	browserSync.reload()
	done()
})

//Clear image cache
task(cacheClear = () => imageminCache.clearAll())

exports.watch = series(clean, parallel(sass, js, img, copy, favicon), server)
exports.build = series(clean, parallel(sass, js, img, copy, favicon))
exports.clear = series(clean, cacheClear)
exports.sass = sass