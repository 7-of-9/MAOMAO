require('dotenv').config()
const express = require('express')
const compression = require('compression')
const Raven = require('raven')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const next = require('next')
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
    '/discovery',
    '/hiring',
    '/smart',
    '/discover'
  ]

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    const dirBuild = '.next'
    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, dirBuild, pathname)
      app.serveStatic(req, res, filePath)
    } else if (pathname === encodeURI(req.session.discoverRootUrl)) {
      app.render(req, res, '/discover')
    } else if (pathname === '/hiring-js') {
      app.render(req, res, '/hiring', {type: 'js'})
    } else if (pathname === '/hiring-vp') {
      app.render(req, res, '/hiring', {type: 'vp'})
    } else if (_.includes(pages, pathname) || pathname.indexOf('_next') !== -1 ||
     pathname.indexOf('favicon') !== -1 || pathname.indexOf('static') !== -1 ||
     pathname.indexOf('.') !== -1 || pathname.indexOf('%20') !== -1 ||
     pathname.indexOf('|') !== -1 || pathname.indexOf('-') !== -1 ||
     pathname === '/'
    ) {
      return handle(req, res, parsedUrl)
    } else {
      // Hack: support FB open graph
      const code = pathname.substr(1)
      log.warn('pathname', pathname)
      log.warn('code', code)
      request('https://mmapi00.azurewebsites.net/share/info?share_code=' + code, (error, response, body) => {
        if (error) {
          log.error(error)
          throw error
        } else {
          const shareInfo = JSON.parse(body)
          if (shareInfo && shareInfo.fullname) {
            return app.render(req, res, '/invite', Object.assign(query, { code, shareInfo }))
          } else {
            return handle(req, res, '/404')
          }
        }
      })
    }
  })

  server.use(Raven.errorHandler())

  server.listen(port, (err) => {
    if (err) {
      log.error(err)
      throw err
    }
    log.warn(`> Ready on http://localhost:${port}`)
  })
})
