const USER_ID = 'userId';
const USER_EMAIL = 'email';

/**
 * Login and run the callback
 * @param  number   user id
 * @param  string   user id
 * @param  function cb
 */
export function login(id, email, cb) {
  localStorage.setItem(USER_ID, id);
  localStorage.setItem(USER_EMAIL, email);
  if (cb) {
    cb();
  }
}

/**
 * Logout and clear user information
 */
export function logout() {
  localStorage.setItem(USER_ID, -1);
  localStorage.setItem(USER_EMAIL, '');
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
 * Check user has login or not
 * @return Boolean
 */
export function isLogin() {
  return userId() > 0;
}
