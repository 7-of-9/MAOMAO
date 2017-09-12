import React from 'react'
import { Provider } from 'mobx-react'
import Home from '../containers/Home'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initDiscoveryStore } from '../stores/discovery'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

export default class DiscoveryPage extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    logger.info('user', user)
    const store = initStore(isServer, userAgent, user)
    const uiStore = initUIStore(isServer)
    let terms = []
    const { search } = query
    if (search) {
      terms = search.split(',')
    }
    logger.info('terms', terms)

    const discovery = initDiscoveryStore(isServer, userAgent, user, terms)
    return { isServer, ...store, ...uiStore, ...discovery }
  }

  constructor (props) {
    super(props)
    this.store = initStore(props.isServer, props.userAgent, props.user)
    this.uiStore = initUIStore(props.isServer)
    this.discovery = initDiscoveryStore(props.isServer, props.userAgent, props.user, props.terms)
    this.store.checkEnvironment()
    this.uiStore.openDiscoveryMode(props.terms)
  }

  componentDidMount () {
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
  }

  render () {
    logger.info('Discovey render')
    return (
      <Provider store={this.store} discovery={this.discovery} ui={this.uiStore}>
        <div className='discovery'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home />
        </div>
      </Provider>
    )
  }
}
