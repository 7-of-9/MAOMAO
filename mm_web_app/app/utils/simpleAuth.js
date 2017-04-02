const USER_ID = 'userId';
const USER_EMAIL = 'email';
const USER_HASH = 'hash';

/**
 * Login and run the callback
 * @param  number   user id
 * @param  string   user id
 * @param  function cb
 */
export function login(id, email, hash, cb) {
  localStorage.setItem(USER_ID, id);
  localStorage.setItem(USER_EMAIL, email);
  localStorage.setItem(USER_HASH, hash);
  if (cb) {
    cb();
  }
}

/**
 * Logout and clear user information
 * @param  function cb
 */
export function logout(cb) {
  localStorage.setItem(USER_ID, -1);
  localStorage.setItem(USER_EMAIL, '');
  localStorage.setItem(USER_HASH, '');
  if (cb) {
    cb();
  }
}

/**
 * Get user id from local storeage
 * @return number
 */
export function userId() {
  return localStorage.getItem(USER_ID) || -1;
}

/**
 * Get user email
 * @return string
 */
export function userEmail() {
  return localStorage.getItem(USER_EMAIL) || '';
}

/**
 * Get user email
 * @return string
 */
export function userHash() {
  return localStorage.getItem(USER_HASH) || '';
}

/**
 * Check user has login or not
 * @return Boolean
 */
export function isLogin() {
  return userId() > 0;
}
