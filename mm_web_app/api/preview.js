const express = require('express')
const router = express.Router()
const request = require('request')

router.get('/', (req, res) => {
  const { url } = req.query
  if (!url) {
    res.status(404).send('Sorry, we cannot find that!')
  }
  request(url, (error, response, body) => {
    if (error) {
      res.status(500).send({ error })
    } else {
      const replace = String.prototype.replace
      const html = replace.call(body, '<head>', `<head><base href="${url}">`)
      res.send(html)
    }
  })
})

module.exports = router
