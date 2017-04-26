const dev = process.env.NODE_ENV !== 'production'
const express = require('express')
const next = require('next')
const { parse } = require('url')
const mobxReact = require('mobx-react')
const request = require('request')
const log = require('loglevel')
const app = next({ dev })
const handle = app.getRequestHandler()
const argv = require('minimist')(process.argv.slice(2))
const port = argv.port || process.env.PORT || 3000
// const graphqlHTTP = require('express-graphql')
// const { buildSchema } = require('graphql')

log.setLevel(dev ? 'info' : 'error')
mobxReact.useStaticRendering(true)

// // define graphql schema
// const schema = buildSchema(`
//   type Query {
//     quoteOfTheDay: String
//     random: Float!
//     rollThreeDice: [Int]
//     rollDice(numDice: Int!, numSides: Int): [Int]
//   }
// `)

// // The root provides a resolver function for each API endpoint
// const root = {
//   quoteOfTheDay: () => {
//     return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'
//   },
//   random: () => {
//     return Math.random()
//   },
//   rollThreeDice: () => {
//     return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6))
//   },
//   rollDice: function (args) {
//     var output = []
//     for (var i = 0; i < args.numDice; i++) {
//       output.push(1 + Math.floor(Math.random() * (args.numSides || 6)))
//     }
//     return output
//   }
// }

app.prepare().then(() => {
  const server = express()

  // server.use('/graphql', graphqlHTTP({
  //   schema,
  //   rootValue: root,
  //   graphiql: true
  // }))

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    if (pathname === '/' || pathname === '/hiring' ||
     pathname === '/discovery' || pathname.indexOf('_next') !== -1 ||
     pathname.indexOf('favicon') !== -1 || pathname.indexOf('static') !== -1
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
