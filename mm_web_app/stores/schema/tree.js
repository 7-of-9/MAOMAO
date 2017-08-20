import { normalize, schema } from 'normalizr'

// Define schema
const term = new schema.Entity('terms', {}, { idAttribute: 'term_id' })
const terms = new schema.Array(term)
term.define({
  child_suggestions: terms,
  child_topics: terms
})
const tree = new schema.Entity('tree', { tree: [term] })

export function normalizedTermData (data) {
  if (data) {
    return normalize(data, tree)
  }
  return { entities: {}, result: {} }
}
