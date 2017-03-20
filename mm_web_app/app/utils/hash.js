import md5 from 'blueimp-md5';

export function md5hash(userId) {
  const hash = md5(userId);
  const toUpperCase = String.prototype.toUpperCase;
  return toUpperCase.call(hash);
}
