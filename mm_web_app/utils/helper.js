const MAX_COLORS = 12

export function tagColor (name) {
  return `tags-color-${(name.length % MAX_COLORS) + 1}`
}

export function dynamicFontSize (text) {
  if (text.length > 20) return '0.8rem'
  if (text.length > 12) return '1rem'
  return '1.5rem'
}
