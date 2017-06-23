const express = require('express')
const router = express.Router()
const Crawler = require('crawler')

const crawler = new Crawler({
  maxConnections: 10
})

router.get('/', (req, res) => {
  const { url } = req.query
  if (!url) {
    res.status(404).send('Sorry, we cannot find that!')
  }
  crawler.queue([{
    uri: url,
    callback: (error, result, done) => {
      if (error) {
        res.status(500).send({ error })
      } else {
        res.send(result.body)
      }
      done()
    }
  }])
})

module.exports = router
