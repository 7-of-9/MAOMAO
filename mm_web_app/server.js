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
const MAILGUN_KEY = 'key-6acu-fqm4j325jes59jc31rq557e83l6'
const mailgun = require('mailgun-js')({apiKey: MAILGUN_KEY, domain: 'productsway.com'})
const mailcomposer = require('mailcomposer')

function sendHTMLEmail (fromEmail, fullName, name, email, topic, url, cb) {
  const title = `Join maomao! ${fullName} want to share with you...`
  const emailTemplate = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>maomao.rocks</title>
        <link href='https://fonts.googleapis.com/css?family=Rokkitt' rel='stylesheet' type='text/css'>
        <style media="all" type="text/css">
        @media all {
          .btn-primary table td:hover {
            background-color: #34495e !important;
          }
          .btn-primary a:hover {
            background-color: #34495e !important;
            border-color: #34495e !important;
          }
        }

        @media all {
          .btn-secondary a:hover {
            border-color: #34495e !important;
            color: #34495e !important;
          }
        }

        @media only screen and (max-width: 620px) {
          table[class=body] h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
          table[class=body] h2 {
            font-size: 22px !important;
            margin-bottom: 10px !important;
          }
          table[class=body] h3 {
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }
          table[class=body] p,
          table[class=body] ul,
          table[class=body] ol,
          table[class=body] td,
          table[class=body] span,
          table[class=body] a {
            font-size: 16px !important;
          }
          table[class=body] .wrapper,
          table[class=body] .article {
            padding: 10px !important;
          }
          table[class=body] .content {
            padding: 0 !important;
          }
          table[class=body] .container {
            padding: 0 !important;
            width: 100% !important;
          }
          table[class=body] .header {
            margin-bottom: 10px !important;
          }
          table[class=body] .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important;
          }
          table[class=body] .btn table {
            width: 100% !important;
          }
          table[class=body] .btn a {
            width: 100% !important;
          }
          table[class=body] .img-responsive {
            height: auto !important;
            max-width: 100% !important;
            width: auto !important;
          }
          table[class=body] .alert td {
            border-radius: 0 !important;
            padding: 10px !important;
          }
          table[class=body] .span-2,
          table[class=body] .span-3 {
            max-width: none !important;
            width: 100% !important;
          }
          table[class=body] .receipt {
            width: 100% !important;
          }
        }

        @media all {
          .ExternalClass {
            width: 100%;
          }
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%;
          }
          .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important;
          }
        }
        </style>
      </head>
      <body class="" style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;" width="100%" bgcolor="#f6f6f6">
          <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;" width="580" valign="top">
              <div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">

                <!-- START CENTERED WHITE CONTAINER -->
                <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${fullName} would like to share the maomao stream with you: <strong>${topic}.</span>
                <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;" width="100%">

                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr><td style="font-family: 'Rokkitt', sans-serif; vertical-align: top;" valign="top"><h1> maomao </h1></td></tr>
                        <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top"> <img src="https://firebasestorage.googleapis.com/v0/b/maomao-testing.appspot.com/o/ps_sirius_dog_blue.png?alt=media&token=36329989-7ca0-4210-a56a-d7a76592ad55" /> </td></tr>
                        <tr>
                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi ${name || 'there'},</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${fullName} would like to share the maomao stream with you: <strong>${topic}.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Click <a href="${url}" target="_blank">here</a> to unlock ${fullName}'s stream - you'll get to see his best picks in this stream on your maomao homepage!</p>
                            <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                      <tbody>
                                        <tr>
                                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;" valign="top" bgcolor="#3498db" align="center"><a href="${url}" target="_blank" style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;">Unlock Now!</a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Kind regards, <br/> maomao Team</p> <br/> www.maomao.rocks</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- END MAIN CONTENT AREA -->
                  </table>

                <!-- START FOOTER -->
                <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; color: #999999; text-align: center;" valign="top" align="center">
                        Powered by <a href="http://maomao.rocks" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">maomao.rocks</a>.
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- END FOOTER -->

    <!-- END CENTERED WHITE CONTAINER --></div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>`
  const joinEmailAddress = 'join@maomao.rocks'

  const mail = mailcomposer({
    from: joinEmailAddress,
    to: email,
    subject: title,
    text: 'Test email text',
    html: emailTemplate
  })

  mail.build((mailBuildError, message) => {
    const dataToSend = {
      to: email,
      message: message.toString('ascii')
    }

    mailgun.messages().sendMime(dataToSend, (sendError, body) => {
      if (sendError) {
        console.error(sendError)
      }
      cb(sendError)
    })
  })
}

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

  server.post('/api/email', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    const { fromEmail, fullName, name, email, topic, url } = req.body
    sendHTMLEmail(fromEmail, fullName, name, email, topic, url, (error) => {
      if (error) {
        res.json({ error })
      } else {
        res.json({ status: true })
      }
    })
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
     pathname.indexOf('.png') !== -1 || pathname.indexOf('.css') !== -1 ||
     pathname.indexOf('.scss') !== -1 || pathname.indexOf('%20') !== -1
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
