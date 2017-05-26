import React from 'react'
import { storiesOf, action } from '@kadira/storybook'
import AppHeader from '../containers/AppHeader'

const store = {
  isProcessing: false,
  googleUser: {},
  facebookUser: {},
  urls: [],
  users: [],
  topics: [],
  userHistory: {me: {}, shares: []},
  normalizedData: {}
}
const uiStore = {
  filterByTopic: [],
  filterByUser: [],
  page: 0,
  rating: 1,
  showSignInModal: false,
  showAcceptInvite: false,
  showShareModal: false,
  notifications: []
}

storiesOf('AppHeader', module)
  .add('default props', () => (
    <AppHeader ui={uiStore} store={store} notify={action('notify')} />
  ))
