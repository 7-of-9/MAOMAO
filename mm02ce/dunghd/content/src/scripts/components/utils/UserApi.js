import axios from 'axios';
import logger from './logger';

function queryString(obj) {
  const str = [];
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`);
  });
  return str.join('&');
}

export function createUser(url, user) {
  return new Promise((resolve, reject) => {
    logger.info('Register user with data', user);
    return axios({
      method: 'post',
      url,
      data: queryString(user),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(response => resolve(response))
      .catch(error => reject(error));
  });
}

export function linkAccount(url, account) {
  return new Promise((resolve, reject) => {
    logger.info('Link user', account);
    return axios({
      method: 'post',
      url,
      data: queryString(account),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(response => resolve(response))
      .catch(error => reject(error));
  });
}
