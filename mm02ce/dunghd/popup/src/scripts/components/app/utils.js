import _ from 'underscore';

const ignoreUrlsStartingWith = [
  'https://www.facebook.com/photo.php?',
  'https://www.facebook.com/home.php',
  'https://www.youtube.com/feed/history',
  'https://www.youtube.com/results',
];
const ignoreUrlsRegex = [/facebook.com\/.*photos/i];

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
  return url.indexOf('chrome://') !== -1;
}

export function processUrl(url) {
  // sanity
  if (url === null || url === '') return false;

  if (url.indexOf('http:') !== 0 && url.indexOf('https://') !== 0) return false;

  const parsedUrl = new URL(url);

  if (
    parsedUrl.pathname == null ||
    parsedUrl.pathname === '' ||
    parsedUrl.pathname === '/'
  ) {
    return false;
  }

  if (_.any(
    ignoreUrlsStartingWith,
    a => url.indexOf(a) === 0,
  )) return false;

  if (_.any(ignoreUrlsRegex, a => a.test(url) === true)) return false;

  return true;
}
