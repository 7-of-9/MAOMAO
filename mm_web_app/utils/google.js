import firebase from 'firebase'
import 'isomorphic-fetch'
import logger from './logger'
import { sendMsgToChromeExtension } from './chrome'

export function fetchContacts (token, limit) {
  /* global fetch */
  return fetch('/api/contacts', {
    method: 'POST',
    // eslint-disable-next-line no-undef
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ token, limit })
  })
}

export function checkGoogleAuth () {
  logger.warn('checkGoogleAuth', firebase.auth().currentUser)
  const promise = new Promise((resolve, reject) => {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/plus.me')
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
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
  return promise
}

export function downloadPhoto (googleToken, googleUserId) {
  sendMsgToChromeExtension(actionCreator('GOOGLE_CONTACTS_FULFILLED', { googleToken, googleUserId }))
  sendMsgToChromeExtension(actionCreator('FETCH_CONTACTS', {}))
}

function actionCreator (type, payload) {
  return {
    type,
    payload
  }
}
