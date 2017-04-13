import localforage from 'localforage'

localforage.config({
  name: 'maomaoApp',
  description: 'Local db'
})

const USER_ID = 'userId'
const USER_EMAIL = 'email'
const USER_HASH = 'hash'

/**
 * Login and run the callback
 * @param  number   user id
 * @param  string   user id
 * @param  function cb
 */
export function login (id, email, hash, cb) {
  localforage.setItem(USER_ID, id)
  localforage.setItem(USER_EMAIL, email)
  localforage.setItem(USER_HASH, hash)
  if (cb) {
    cb()
  }
}

/**
 * Logout and clear user information
 * @param  function cb
 */
export function logout (cb) {
  localforage.setItem(USER_ID, -1)
  localforage.setItem(USER_EMAIL, '')
  localforage.setItem(USER_HASH, '')
  if (cb) {
    cb()
  }
}

/**
 * Get user id from local storeage
 * @return number
 */
export function userId () {
  return localforage.getItem(USER_ID)
    .then(userId => userId || -1)
    .catch(() => -1)
}

/**
 * Get user email
 * @return string
 */
export function userEmail () {
  return localforage.getItem(USER_EMAIL)
    .then(email => email || '').catch(() => '')
}

/**
 * Get user email
 * @return string
 */
export function userHash () {
  return localforage.getItem(USER_HASH)
    .then(hash => hash || '').catch(() => '')
}

/**
 * Check user has login or not
 * @return Boolean
 */
export function isLogin () {
  return userId() > 0
}
