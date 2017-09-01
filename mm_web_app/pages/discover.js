import React from 'react'
import { toJS } from 'mobx'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initTermStore } from '../stores/term'
import Discover from '../containers/Discover'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

export default class DiscoverPage extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    logger.warn('Discover query', query)
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user, false)
    const uiStore = initUIStore(isServer)
    const term = initTermStore(isServer, query.findTerms, query.termsInfo)
    return { isServer, ...store, ...uiStore, ...term, findTerms: query.findTerms, termsInfo: query.termsInfo }
  }

  constructor (props) {
    super(props)
    logger.warn('Discover', props)
    this.store = initStore(props.isServer, props.userAgent, props.user, false)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.term = initTermStore(props.isServer, props.findTerms, props.termsInfo)
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
    const { findTerms, termsInfo } = toJS(this.term)
    const currentTerm = termsInfo.terms.find(item => item.term_name.toLowerCase() === findTerms[findTerms.length - 1].toLowerCase())
    this.store.setTerms(termsInfo.terms)
    if (currentTerm && currentTerm.term_id) {
      this.uiStore.selectDiscoveryTerm(currentTerm.term_id)
      this.term.getTermDiscover(currentTerm.term_id)
    }
  }

  render () {
    logger.warn('Discover render', this.store)
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
