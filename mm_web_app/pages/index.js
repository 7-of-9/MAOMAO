import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initDiscoveryStore } from '../stores/discovery'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

export default class Index extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user, true)
    const uiStore = initUIStore(isServer)

    let terms = []
    const { search } = query
    if (search) {
      terms = search.split(',')
    }
    logger.warn('terms', terms)
    const discovery = initDiscoveryStore(isServer, userAgent, user, terms)
    return { isServer, ...store, ...uiStore, ...discovery }
  }

  constructor (props) {
    super(props)
    logger.warn('Index', props)
    this.store = initStore(props.isServer, props.userAgent, props.user, true)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.discovery = initDiscoveryStore(props.isServer, props.userAgent, props.user, props.terms)
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
    logger.warn('Index render', this.store)
    return (
      <Provider store={this.store} discovery={this.discovery} ui={this.uiStore}>
        <div className='home'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home />
        </div>
      </Provider>
    )
  }
}
