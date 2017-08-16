import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initTermStore } from '../stores/term'
import Discover from '../containers/Discover'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

export default class Test extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user, false)
    const uiStore = initUIStore(isServer)

    const term = initTermStore(isServer, userAgent, user)
    return { isServer, ...store, ...uiStore, ...term }
  }

  constructor (props) {
    super(props)
    logger.warn('Index', props)
    this.store = initStore(props.isServer, props.userAgent, props.user, false)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.term = initTermStore(props.isServer, props.userAgent, props.user)
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
      <Provider store={this.store} term={this.term} ui={this.uiStore}>
        <div className='discover'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Discover />
        </div>
      </Provider>
    )
  }
}
