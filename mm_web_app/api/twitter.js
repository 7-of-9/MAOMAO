const express = require('express')
const router = express.Router()
const Twitter = require('twitter-node-client').Twitter
const LIMIT = 10
const TWITTER_API_KEY = 'wKeQKvrWWSxhwXKAlgYWU59jY'
const TWITTER_API_SECRET = 'qqaMavssKwguBitPjkvdSunZaKXkQ0OlHzZOcwN5cI1hQaSfhX'
const TWITTER_TOKEN = '89360130-oQRgnzOkZVCVPgfkLtV0qZAMV6GaKzgWD9vxzBu5q'
const TWITTER_TOKEN_SECRET = '3GorBw1lyujy1AnRU7mjJkuj6Zm37MwxggVBXohiogeaF'

router.post('/', (req, res) => {
  const { keyword, page, maxId } = req.body
  if (!keyword) {
    return res.status(404).json({error: 'Sorry, missing keyword!'})
  }

  const twitter = new Twitter({
    consumerKey: TWITTER_API_KEY,
    consumerSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_TOKEN,
    accessTokenSecret: TWITTER_TOKEN_SECRET
  })

  const searchOptions = {
    q: keyword, count: (page || 1) * LIMIT, result_type: 'popular'
  }

  if (maxId) {
    searchOptions.max_id = maxId
  }

  twitter.getSearch(searchOptions, (error) => {
    res.status(500).send({ error })
  }, (tweets) => {
    res.json({ tweets: JSON.parse(tweets) })
  })
})

module.exports = router
