const MAX_COLORS = 12

export function tagColor (name) {
  return `tags-color-${(name.length % MAX_COLORS) + 1}`
}
