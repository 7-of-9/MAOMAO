import axios from 'axios'

export default function fbScrapeShareUrl (url) {
  return axios({
    method: 'post',
    url: `https://graph.facebook.com?scrape=true&id=${url}`
  })
}
