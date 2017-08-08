const express = require('express')
const router = express.Router()
const request = require('request')
const cheerio = require('cheerio')
const _ = require('lodash')
const queryString = require('query-string')
const url = require('url')
const log = require('loglevel')
const dev = process.env.NODE_ENV !== 'production'

const SITE_URL = dev ? 'http://localhost:3000/' : 'https://maomaoweb.azurewebsites.net/'

router.get('/', (req, res) => {
  const { query, body, params } = req
  const { url: baseUrl } = req.query
  log.warn('GET: Load url via proxy', baseUrl, query, body, params)
  if (!baseUrl) {
    res.status(404).send('Sorry, we cannot find that!')
  } else {
    let queryData = {}
    if (Object.keys(query).length !== 1) {
      queryData = Object.assign({}, _.omit(query, 'url'))
    }
    log.warn('queryData', queryData)
    request({
      method: 'GET',
      url: `${baseUrl}?${queryString.stringify(queryData)}`
    }, (error, response, body) => {
      if (error) {
        res.status(500).send({ error })
      } else {
        log.warn('href', response.request.uri.href)
        const replace = String.prototype.replace
        const html = replace.call(body, '<head>', `<head><base href="${response.request.uri.href}">`)
        const $ = cheerio.load(html)
        // covert to absoluate url
        $('meta').each((index, item) => {
          const metaProp = $(item).attr('itemprop')
          const metaContent = $(item).attr('content')
          metaProp === 'image' && $(item).attr('content', url.resolve(response.request.uri.href, metaContent))
        })

        $('form').each((index, item) => {
          const actionSrc = $(item).attr('action')
          actionSrc && $(item).attr('action', SITE_URL + 'api/preview?url=' + url.resolve(response.request.uri.href, actionSrc))
          actionSrc && $(item).append(`<input name="url" type="hidden" value="${url.resolve(response.request.uri.href, actionSrc)}" />`)
        })

        $('img').each((index, item) => {
          const imgSrc = $(item).attr('src')
          imgSrc && $(item).attr('src', url.resolve(response.request.uri.href, imgSrc))
        })

        $('a, link').each((index, item) => {
          const href = $(item).attr('href')
          href && href !== '#' && $(item).attr('href', url.resolve(response.request.uri.href, href))
        })

        res.set('Content-Type', 'text/html; charset=utf-8')
        const rawHtml = replace.call($.html(), '</body>', `<script src='${SITE_URL}static/js/maomao-embed.js' /></script>`)

        res.send(rawHtml)
      }
    })
  }
})

module.exports = router
