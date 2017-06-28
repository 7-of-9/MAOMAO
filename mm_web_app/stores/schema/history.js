import { normalize, schema } from 'normalizr'

// Define a users schema
const url = new schema.Entity('urls', {}, { idAttribute: 'url_id' })
const topic = new schema.Entity('topics', {
}, { idAttribute: 'term_id' })

// Define your comments schema
const myStream = new schema.Entity('myStreams', {
  urls: [url]
}, { idAttribute: 'user_id' })

const sharedList = new schema.Entity('shareLists', {
  urls: [url]
}, { idAttribute: 'share_code' })

const friendStream = new schema.Entity('friendStreams', {
  shares: [sharedList]
}, { idAttribute: 'user_id' })

// Define your article
const history = new schema.Entity('histories', {
  mine: myStream,
  received: [ friendStream ],
  topics: [topic]
}, { idAttribute: 'mine' })

export function normalizedHistoryData (data) {
  if (data) {
    return normalize(data, history)
  }
  return { entities: {}, result: {} }
}
