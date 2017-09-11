import React from 'react'
import { Provider } from 'mobx-react'
import Error from 'next/error'
import 'isomorphic-fetch'
import _ from 'lodash'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initTermStore } from '../stores/term'
import { MAOMAO_API_URL } from '../containers/App/constants'
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
    logger.warn('DiscoverPage query', query)
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user, false)
    const uiStore = initUIStore(isServer)
    let termsInfo = {terms: []}
    let findTerms = []
    let statusCode = true
    if (query) {
      if (query.findTerms) {
        findTerms = query.findTerms
      }
      const lockupTerms = _.map(findTerms, item => `names[]=${item}`).join('&')
      logger.warn('fetch URL', `${MAOMAO_API_URL}term/lookup?${lockupTerms}`)
      /* global fetch */
      const res = await fetch(`${MAOMAO_API_URL}term/lookup?${lockupTerms}`)
      const json = await res.json()
      statusCode = res.statusCode > 200 ? res.statusCode : false
      logger.warn('fetch json', json)
      termsInfo = json
      if (termsInfo.terms.indexOf(null) !== -1 || termsInfo.terms.length !== findTerms.length) {
        statusCode = 404
      }
    }
    const term = initTermStore(isServer, findTerms, termsInfo)
    return { isServer, ...store, ...uiStore, ...term, findTerms, termsInfo, statusCode }
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
    logger.warn('DiscoverPage componentDidMount')
  }

  componentWillUpdate () {
    logger.warn('DiscoverPage componentWillUpdate', this)
    // FIXME: back button on browser
    if (this.term.findTerms.length !== this.props.findTerms.length) {
      // this.term.setCurrentTerms(this.props.findTerms)
    }
  }

  render () {
    logger.warn('DiscoverPage render', this.store)
    if (this.props.statusCode) {
      return <Error statusCode={this.props.statusCode} />
    }
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
