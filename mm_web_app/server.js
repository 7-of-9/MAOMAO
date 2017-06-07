const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const next = require('next')
const { parse } = require('url')
const mobxReact = require('mobx-react')
const request = require('request')
const admin = require('firebase-admin')
const log = require('loglevel')

const firebase = admin.initializeApp({
  credential: admin.credential.cert(require('./firebaseCredentials').serverCredentials),
  databaseURL: 'https://maomao-testing.firebaseio.com'
}, 'server')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const argv = require('minimist')(process.argv.slice(2))
const port = argv.port || process.env.PORT || 3000

log.setLevel(dev ? 'info' : 'error')
mobxReact.useStaticRendering(true)

app.prepare().then(() => {
  const server = express()
  server.use(bodyParser.json())
  server.use(session({
    secret: 'REDACTED_SECRET',
    saveUninitialized: true,
    store: new FileStore({path: '/tmp/sessions', secret: 'REDACTED_SECRET'}),
    resave: false,
    rolling: true,
    httpOnly: true,
    cookie: { maxAge: 604800000 } // week
  }))

  server.use((req, res, next) => {
    req.firebaseServer = firebase
    next()
  })

  server.post('/api/login', (req, res) => {
    if (!req.body) return res.sendStatus(400)

    const token = req.body.token
    firebase.auth().verifyIdToken(token)
      .then((decodedToken) => {
        req.session.decodedToken = decodedToken
        return decodedToken
      })
      .then((decodedToken) => res.json({ status: true, decodedToken }))
      .catch((error) => res.json({ error }))
  })

  server.post('/api/logout', (req, res) => {
    req.session.decodedToken = null
    res.json({ status: true })
  })

  server.post('/api/contacts', (req, res) => {
    const { token, limit } = req.body
    const options = { method: 'GET',
      url: 'https://www.google.com/m8/feeds/contacts/default/full',
      qs: { alt: 'json',
        'max-results': limit,
        'start-index': 1,
        v: '3.0',
        orderby: 'lastmodified',
        sortorder: 'descending'
      },
      headers: {
        'cache-control': 'no-cache',
        authorization: 'Bearer ' + token }
    }
    request(options, (error, response, body) => {
      if (error) {
        res.json({ error })
      }
      const contacts = []
      const data = JSON.parse(body)
      if (data.feed && data.feed.entry) {
        data.feed.entry.forEach((item) => {
          const ref = item.gd$email
          let image = ''
          if (item.link && item.link[0] && item.link[0].href) {
            image = `${item.link[0].href}&access_token=${token}`
          }
          if (ref && ref[0] && ref[0].address) {
            contacts.push({
              email: ref[0].address,
              name: item.title.$t,
              image
            })
          }
        })
      }
      res.json({contacts})
    })
  })

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    if (pathname === '/' || pathname.indexOf('hiring') !== -1 ||
     pathname === '/discovery' || pathname.indexOf('_next') !== -1 ||
     pathname.indexOf('favicon') !== -1 || pathname.indexOf('static') !== -1 ||
     pathname.indexOf('.png') !== -1 || pathname.indexOf('.css') !== -1 || pathname.indexOf('.scss') !== -1
    ) {
      return handle(req, res, parsedUrl)
    } else {
      // Hack: support FB open graph
      const code = pathname.substr(1)
      request('https://mmapi00.azurewebsites.net/share/info?share_code=' + code, (error, response, body) => {
        if (error) {
          log.error(error)
          throw error
        }
        return app.render(req, res, '/invite', Object.assign(query, { code, shareInfo: JSON.parse(body) }))
      })
    }
  })

  server.listen(port, (err) => {
    if (err) {
      log.error(err)
      throw err
    }
    log.warn('> Ready on http://localhost:3000')
  })
})
