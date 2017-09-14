require('dotenv').config()
const express = require('express')
const compression = require('compression')
const Raven = require('raven')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const next = require('next')
const pathMatch = require('path-match')
const { parse } = require('url')
const { join } = require('path')
const mobxReact = require('mobx-react')
const request = require('request')
const _ = require('lodash')
const log = require('loglevel')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const argv = require('minimist')(process.argv.slice(2))
const port = argv.port || process.env.PORT || 3000
const auth = require('./api/auth')
const email = require('./api/email')
const preview = require('./api/preview')
const contacts = require('./api/contacts')
const twitter = require('./api/twitter')

log.setLevel(dev ? 'info' : 'error')
mobxReact.useStaticRendering(true)
Raven.config('https://REDACTED_SENTRY_DSN@sentry.io/191653').install()

app.prepare().then(() => {
  const server = express()
  server.use(Raven.requestHandler())
  server.use(compression())
  server.use(bodyParser.json())
  server.use(session({
    secret: 'REDACTED_SECRET',
    saveUninitialized: true,
    store: new FileStore({path: './tmp/sessions', secret: 'REDACTED_SECRET'}),
    resave: false,
    rolling: true,
    httpOnly: true,
    cookie: { maxAge: 604800000 } // week
  }))

  server.use('/api/auth', auth)
  server.use('/api/email', email)
  server.use('/api/contacts', contacts)
  server.use('/api/preview', preview)
  server.use('/api/twitter', twitter)

  const pages = [
    '/old',
    '/discovery',
    '/hiring',
    '/smart',
    '/discover'
  ]
  const route = pathMatch()
  const matchRoute = route('/:code')
  const API_URL = process.env.API_URL
  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    const dirBuild = '.next'
    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, dirBuild, pathname)
      app.serveStatic(req, res, filePath)
    } else if (pathname === encodeURI(req.session.discoverRootUrl)) {
      log.warn('found special route url', req.session.discoverRootUrl)
      app.render(req, res, '/discover', Object.assign({}, query, { profileUrl: req.session.discoverRootUrl, currentUser: req.session.currentUser }))
    } else if (pathname === '/hiring-js') {
      app.render(req, res, '/hiring', {type: 'js'})
    } else if (pathname === '/hiring-vp') {
      app.render(req, res, '/hiring', {type: 'vp'})
    } else if (_.includes(pages, pathname) || _.indexOf(pathname, '_next') !== -1 ||
     _.indexOf(pathname, 'favicon') !== -1 || _.indexOf(pathname, 'static') !== -1 ||
     _.indexOf(pathname, '.') !== -1 || _.indexOf(pathname, '%20') !== -1 ||
     _.indexOf(pathname, '|') !== -1 || _.indexOf(pathname, '-') !== -1 || pathname === '/'
    ) {
      return handle(req, res, parsedUrl)
    } else {
      // Hack: support FB open graph
      const params = matchRoute(pathname)
      log.info('params', params)
      if (params) {
        const { code } = params
        log.info('pathname', pathname)
        log.info('code', code)
        request(`${API_URL}share/info?share_code=${code}`, (error, response, body) => {
          if (error) {
            log.error(error)
            throw error
          } else {
            let shareInfo
            try {
              shareInfo = JSON.parse(body)
            } catch (error) {
              return handle(req, res, '_error')
            }
            if (shareInfo && shareInfo.fullname) {
              return app.render(req, res, '/invite', Object.assign(query, { code, shareInfo }))
            } else {
              // check that is term for discover mode
              return app.render(req, res, '/discover', Object.assign(query, { findTerms: [decodeURI(code)] }))
            }
          }
        })
      } else {
        // maybe that is multi terms
        const findTerms = pathname.split('/').filter(item => item.length > 0).map(item => decodeURI(item))
        return app.render(req, res, '/discover', Object.assign(query, { findTerms }))
      }
    }
  })

  server.use(Raven.errorHandler())

  server.listen(port, (err) => {
    if (err) {
      log.error(err)
      throw err
    }
    log.info(`> Ready on http://localhost:${port}`)
  })
})
