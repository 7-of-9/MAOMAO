import React from 'react'
import { Provider, observer } from 'mobx-react'
import _ from 'lodash'
import { initStore } from '../stores/invite'
import { initUIStore } from '../stores/ui'
import { initTermStore } from '../stores/term'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

@observer
export default class Invite extends React.Component {
  static async getInitialProps ({ req, query: { code, shareInfo } }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.currentUser : null
    logger.info('user', user)
    const store = initStore(isServer, userAgent, user, code, shareInfo)
    const uiStore = initUIStore(isServer)
    logger.info('Invite', code, shareInfo)
    const bgImageResult = await store.searchBgImage()
    try {
      logger.info('bgImageResult', bgImageResult)
      const { result } = bgImageResult.data
      const images = _.filter(result, item => item.img && item.img.length > 0)
      if (images.length > 0) {
        store.bgImage = images[Math.floor(Math.random() * images.length)].img
      } else {
        store.bgImage = ''
      }
    } catch (err) {
      store.bgImage = ''
    }
    const term = initTermStore(isServer, [], { terms: [] })
    return { isServer, ...store, ...uiStore, ...term }
  }

  constructor (props) {
    super(props)
    logger.info('Invite', props)
    this.uiStore = initUIStore(props.isServer)
    this.term = initTermStore(props.isServer, props.findTerms, props.termsInfo)
    this.store = initStore(props.isServer, props.userAgent, props.user, props.shareCode, props.shareInfo)
    this.store.bgImage = props.bgImage
    this.store.checkEnvironment()
  }

  componentDidMount () {
    logger.warn('Invite componentDidMount', this)
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          logger.log('service worker registration successful')
        })
        .catch(err => {
          logger.info('service worker registration failed', err.message)
        })
    }
    // TODO: accept invite code
    if (this.store.isLogin) {
      this.uiStore.redirectToSpecialUrl(true)
      this.uiStore.addNotification('You will redirect to your profile.')
      window.location.href = '/'
    }
  }

  render () {
    logger.info('Invite render')
    return (
      <Provider store={this.store} term={this.term} ui={this.uiStore}>
        <div className='invite'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home />
        </div>
      </Provider>
    )
  }
}
