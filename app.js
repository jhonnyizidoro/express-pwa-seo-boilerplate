const helpers = require('./http/helpers/helpers')
const assets = require('express-asset-versions')
const routes = require('./http/routes/routes')
const compression = require('compression')
const device = require('express-device')
const express = require('express')
const morgan = require('morgan')
const env = require('./env')

// Init Express
const app = express()

//Funções de escopo global
Object.assign(global, env)
Object.assign(global, helpers)

//Porta de execução
const port = 80

//Atributos globais da instância do APP
app.set('port', port)
app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')
app.enable('trust proxy')

//Muddlewares
app.use(morgan('dev'))
app.use(compression())
app.use(device.capture())
app.use('/', express.static(`${__dirname}/public`))
app.use('/', express.static(`${__dirname}/public/global`))
app.use(assets('/', `${__dirname}/public`))
app.use((req, res, next) => {
	global.mobile = req.device.type !== 'desktop'
	global.host = `${req.protocol}://${req.get('host')}`
	global.url = `${global.host}${req.url}`
	res.locals.session = req.session
	next()
})

//Rotas
routes(app)

// error handler
app.use((err, req, res) => {
	res.status(err.status || 500)
	res.render('error')
})

// Init Server
app.listen(port, () => console.log('server On!'))