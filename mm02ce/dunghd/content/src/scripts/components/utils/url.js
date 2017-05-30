// remove trailing page anchor # from URL
export default function removeHashOnUrl(url) {
  let urlHash = url;
  const hashPosition = urlHash.indexOf('#');
  if (hashPosition !== -1) {
    urlHash = urlHash.substring(0, hashPosition);
  }
  return urlHash;
}
