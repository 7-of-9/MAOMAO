import axios from 'axios'
import firebase from 'firebase'
import logger from './logger'
import { guid } from './hash'
import { sendMsgToChromeExtension } from './chrome'

const throttledQueue = require('throttled-queue')
const throttle = throttledQueue(10, 1000)

export function fetchContacts (token, page, limit) {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('Missing OAuth token'))
    }

    const url = buildUrlPath({ page, limit })
    return axios.get(url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        if (response.status > 300 || response.status < 200) {
          return reject(new Error(`Status code: ${response.statusCode}`))
        }
        const data = response.data
        const contacts = []
        let total = 0
        if (data.feed && data.feed.entry) {
          total = Number(data.feed.openSearch$totalResults.$t)
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
                key: guid(),
                image
              })
            }
          })
        }
        return resolve({
          total,
          page,
          data: contacts
        })
      })
      .catch(error => reject(error))
  })
}

export function checkGoogleAuth () {
  logger.warn('checkGoogleAuth', firebase.auth().currentUser)
  const promise = new Promise((resolve, reject) => {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/plus.me')
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
    firebase.auth().currentUser.linkWithPopup(provider).then((result) => {
      const googleToken = result.credential.accessToken
      const user = result.user
      let googleUserId = ''
      let googleEmail = ''
      if (user.providerData && user.providerData.length) {
        for (let counter = 0; counter < user.providerData.length; counter += 1) {
          if (user.providerData[counter].providerId === 'google.com') {
            googleUserId = user.providerData[counter].uid
            googleEmail = user.providerData[counter].email
            break
          }
        }
      }
      return resolve({
        googleUserId,
        googleToken,
        info: {
          name: user.displayName,
          email: user.email || googleEmail,
          picture: user.photoURL
        }
      })
    }).catch(() => {
      // fallback to sigined account
      firebase.auth().signInWithPopup(provider).then((result) => {
        const googleToken = result.credential.accessToken
        const user = result.user
        let googleUserId = ''
        let googleEmail = ''
        if (user.providerData && user.providerData.length) {
          for (let counter = 0; counter < user.providerData.length; counter += 1) {
            if (user.providerData[counter].providerId === 'google.com') {
              googleUserId = user.providerData[counter].uid
              googleEmail = user.providerData[counter].email
              break
            }
          }
        }
        return resolve({
          googleUserId,
          googleToken,
          info: {
            name: user.displayName,
            email: user.email || googleEmail,
            picture: user.photoURL
          }
        })
      }).catch(error => reject(error))
    })
  })
  return promise
}

export function downloadPhoto (contacts) {
  const photos = []
  sendMsgToChromeExtension(actionCreator('FETCH_CONTACTS_FULFILLED', { data: contacts }))
  contacts.forEach((contact) => {
    if (contact.image && contact.image.indexOf('http') !== -1) {
      throttle(() => {
        base64ImageFromUrl(contact.image, (err, base64Image) => {
          if (err) {
            photos.push({
              ...contact,
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAKlBMVEXMzMz////8/Pza2trQ0NDf39/29vbW1tbp6ens7Ozy8vL5+fni4uLm5uZ/0ezOAAAB3UlEQVRo3u2XvUoDURCFE4y6MRY5GzbEoMWCIAhCbAStRFAsk9Y0Bn2A4BNswAeI2FoYxT4g6bW01CeysNAku7Mz99jlfv0c7s+cuecWPB6PZ0FY/XgCsPvQd6w/jPFDeO9SXuril8mxXeALf9kz1x9gmitjfYBZEtsB9DBL3XQMN5hnx9IAMeYJ+6YFUEsoxUgjVJ/CCtK51AoMkE5DWb+ELFrqHXB7+EQWW4Y7IO5hGdm0NQIVQWCsEdgXBGoagTtBYEMjEAsCocaJkFA4ch0Sb/kCZUgM8wXWIPGYL1CERNULLIgA0UhEK7Nm4u3MDxR+pPFDlR/r/MPCP23848o/73zA4CMOH7L4mMcHTT7q8mGbj/v8h6NwOsI0r44/PsDp63eBFF709V2kMtHWHyGDZ139OTK5VZk5FqZ6S9FCAwg08rvpDCLXRhvZHdVBDpHiTZBpcwsAInIB8hI6UBCps4U9ZJxAxbY4x2Tk4RZASSJEExU15XtkjQkB1CTCDog9jKCmKbaxaztXYGAs+cDVDyMYaGqTlSFulWFiKDjR0ZEdmIhUvwTTxwFGxEtwuYYARhJlulUH9yKMVOVhYB8J7zCyKXwRVDRkL9r92IOROtmIgBfwAv8owLfyN0kjHr6c7ddbAAAAAElFTkSuQmCC'
            })
          } else {
            photos.push({
              ...contact,
              image: base64Image
            })
          }
        })
      })
    }
  })
  throttle(() => {
    setTimeout(() => {
      // TODO: Update store
      sendMsgToChromeExtension(actionCreator('DOWNLOAD_PHOTO_DONE', { photos }))
    }, 1000)
  })
}

function actionCreator (type, payload) {
  return {
    type,
    payload
  }
}

function base64ImageFromUrl (url, callback) {
  /* global XMLHttpRequest, FileReader */
  const xhr = new XMLHttpRequest()
  xhr.onload = (ev) => {
    if (ev.target && ev.target.status === 200) {
      const reader = new FileReader()
      reader.onloadend = () => {
        callback(null, reader.result)
      }
      reader.readAsDataURL(xhr.response)
    } else {
      callback(new Error(`Not found image, error code ${ev.target.status}`))
    }
  }
  xhr.open('GET', url)
  xhr.responseType = 'blob'
  xhr.send()
}

function buildUrlPath (params) {
  let options = {
    type: 'contacts',
    alt: 'json',
    projection: 'full',
    email: 'default',
    limit: 5000,
    page: 1,
    v: '3.0',
    orderby: 'lastmodified',
    sortby: 'descending'
  }
  options = Object.assign(options, params)

  const query = {
    alt: options.alt,
    'max-results': options.limit,
    'start-index': ((options.page - 1) * options.limit) + 1,
    v: options.v,
    orderby: options.orderby,
    sortorder: options.sortby
  }

  const path = `https://www.google.com/m8/feeds/${options.type}/${options.email}/${options.projection}?${queryString(query)}`
  return path
}

function queryString (obj) {
  const str = []
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`)
  })
  return str.join('&')
}
