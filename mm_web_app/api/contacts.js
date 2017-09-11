const express = require('express')
const router = express.Router()
const request = require('request')
const _ = require('lodash')

router.post('/', (req, res) => {
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
      _.forEach(data.feed.entry, (item) => {
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

module.exports = router
