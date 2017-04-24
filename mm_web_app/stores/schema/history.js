import { normalize, schema } from 'normalizr'

// Define a users schema
const url = new schema.Entity('urls')
const topic = new schema.Entity('topics', {}, { idAttribute: 'term_id' })

// Define your comments schema
const myStream = new schema.Entity('myStreams', {
  topics: [topic],
  urls: [url]
}, { idAttribute: 'user_id' })

const sharedList = new schema.Entity('shareLists', {
  urls: [url]
}, { idAttribute: 'share_code' })

const friendStream = new schema.Entity('friendStreams', {
  list: [sharedList]
}, { idAttribute: 'user_id' })

// Define your article
const history = new schema.Entity('histories', {
  me: myStream,
  shares: [ friendStream ]
}, { idAttribute: 'me' })

export function normalizedHistoryData (data) {
  return normalize(data, history)
}
