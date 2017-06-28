const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const firebase = admin.initializeApp({
  credential: admin.credential.cert(require('../firebaseCredentials').serverCredentials),
  databaseURL: 'https://maomao-testing.firebaseio.com'
}, 'server')

router.use((req, res, next) => {
  req.firebaseServer = firebase
  next()
})

router.post('/login', (req, res) => {
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

router.post('/logout', (req, res) => {
  req.session.decodedToken = null
  res.json({ status: true })
})

module.exports = router
