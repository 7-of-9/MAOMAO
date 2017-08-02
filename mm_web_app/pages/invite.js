import React from 'react'
import { Provider, observer } from 'mobx-react'
import { initStore } from '../stores/invite'
import { initUIStore } from '../stores/ui'
import { initDiscoveryStore } from '../stores/discovery'
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
    const user = req && req.session ? req.session.decodedToken : null
    logger.warn('user', user)
    const store = initStore(isServer, userAgent, user, code, shareInfo)
    const uiStore = initUIStore(isServer)
    logger.warn('Invite', code, shareInfo)
    const bgImageResult = await store.searchBgImage()
    try {
      logger.warn('bgImageResult', bgImageResult)
      const { result } = bgImageResult.data
      const images = result.filter(item => item.img && item.img.length > 0)
      if (images.length > 0) {
        store.bgImage = images[Math.floor(Math.random() * images.length)].img
      } else {
        store.bgImage = ''
      }
    } catch (err) {
      store.bgImage = ''
    }
    const discovery = initDiscoveryStore(isServer, userAgent, user, [])
    return { isServer, ...store, ...uiStore, ...discovery }
  }

  constructor (props) {
    super(props)
    logger.warn('Invite', props)
    this.uiStore = initUIStore(props.isServer)
    this.discovery = initDiscoveryStore(props.isServer, props.userAgent, props.user, props.terms)
    this.store = initStore(props.isServer, props.userAgent, props.user, props.shareCode, props.shareInfo)
    this.store.bgImage = props.bgImage
    this.store.checkEnvironment()
  }

  componentDidMount () {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          logger.log('service worker registration successful')
        })
        .catch(err => {
          logger.warn('service worker registration failed', err.message)
        })
    }
  }

  render () {
    return (
      <Provider store={this.store} discovery={this.discovery} ui={this.uiStore}>
        <div className='invite'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home {...this.store} {...this.uiStore} {...this.discovery} />
        </div>
      </Provider>
    )
  }
}
