const MAX_COLORS = 12
const toLowerCase = String.prototype.toLowerCase

export function tagColor (name) {
  return `tags-color-${(name.length % MAX_COLORS) + 1}`
}

export function dynamicFontSize (text) {
  if (text.length > 20) return '0.8rem'
  if (text.length > 12) return '1rem'
  return '1.5rem'
}

export function isSameStringOnUrl (str1, str2) {
  return encodeURI(toLowerCase.call(str1)) === encodeURI(toLowerCase.call(str2))
}
