import axios from 'axios';
import * as logger from 'loglevel';

function queryString(obj) {
  const str = [];
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`);
  });
  return str.join('&');
}

const defaultOptions = {
  toolbar: 'no',
  location: 'no',
  directories: 'no',
  status: 'no',
  menubar: 'no',
  scrollbars: 'yes',
  resizable: 'yes',
  width: 500,
  height: 400,
  top: (o, w) => ((w.innerHeight - o.height) / 2) + w.screenY,
  left: (o, w) => ((w.innerWidth - o.width) / 2) + w.screenX,
};

const createOptions = () => {
  const ret = [];
  /* eslint-disable no-restricted-syntax */
  for (const key in defaultOptions) {
    if (Object.prototype.hasOwnProperty.call(defaultOptions, key)) {
      ret.push(`${key}=${
        typeof defaultOptions[key] === 'function' ?
          defaultOptions[key].call(this, defaultOptions, window) :
          defaultOptions[key]}`,
      );
    }
  }
  return ret.join(',');
};

export function openUrl(url) {
  window.open(url, 'Loading', createOptions());
}

export function isInternalTab(url) {
  return url.indexOf('chrome://') !== -1 || url.indexOf('chrome-extension') !== -1;
}

export function removeHashFromUrl(url) {
  const pos = url.indexOf('#');
  if (url.indexOf('#') !== -1) {
    return url.substring(0, pos);
  }
  return url;
}

export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}${s4()}`;
}

export function fbScrapeShareUrl(url) {
  // https://graph.facebook.com?scrape=true&id=http://www.maomao.rocks/
  return axios({
    method: 'post',
    url: `https://graph.facebook.com?scrape=true&id=${url}`,
  });
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
