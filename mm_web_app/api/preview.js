const express = require('express')
const router = express.Router()
const request = require('request')
const cheerio = require('cheerio')
const url = require('url')

router.get('/', (req, res) => {
  const { url: baseUrl } = req.query
  if (!baseUrl) {
    res.status(404).send('Sorry, we cannot find that!')
  } else {
    request(baseUrl, (error, response, body) => {
      if (error) {
        res.status(500).send({ error })
      } else {
        const replace = String.prototype.replace
        const html = replace.call(body, '<head>', `<head><base href="${baseUrl}">`)
        const $ = cheerio.load(html)
        // cover to absoluate url
        $('meta').each((index, item) => {
          const metaProp = $(item).attr('itemprop')
          const metaContent = $(item).attr('content')
          if (metaProp === 'image') {
            $(item).attr('content', url.resolve(baseUrl, metaContent))
          }
        })

        $('img').each((index, item) => {
          const imgSrc = $(item).attr('src')
          if (imgSrc) {
            $(item).attr('src', url.resolve(baseUrl, imgSrc))
          }
        })

        $('a, link').each((index, item) => {
          const href = $(item).attr('href')
          if (href !== '#') {
            $(item).attr('href', url.resolve(baseUrl, href))
          }
        })

        res.set('Content-Type', 'text/html; charset=utf-8')
        res.send($.html())
      }
    })
  }
})

module.exports = router
