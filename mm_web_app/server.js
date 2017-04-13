const { createServer } = require('http')
const { parse } = require('url')
const mobxReact = require('mobx-react')
const next = require('next')
const log = require('loglevel')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const argv = require('minimist')(process.argv.slice(2))
const port = argv.port || process.env.PORT || 3000

log.setLevel(dev ? 'info' : 'error')
mobxReact.useStaticRendering(true)

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    if (pathname === '/' || pathname === '/hiring' || pathname === '/discovery' || pathname.indexOf('_next') !== -1) {
      handle(req, res, parsedUrl)
    } else {
      // TODO: Need to handle 404 page
      app.render(req, res, '/invite', Object.assign(query, { code: pathname.substr(1) }))
    }
  })
    .listen(port, (err) => {
      if (err) {
        log.error(err)
        throw err
      }
      log.warn('> Ready on http://localhost:3000')
    })
})
