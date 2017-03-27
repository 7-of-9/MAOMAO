import _ from 'underscore';

const ignoreUrlsStartingWith = [
  'https://www.facebook.com/photo.php?',
  'https://www.facebook.com/home.php',
  'https://www.youtube.com/feed/history',
  'https://www.youtube.com/results',
];
const ignoreUrlsRegex = [/facebook.com\/.*photos/i];

export default function processUrl(url) {
  // sanity
  if (url == null) return false;

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
