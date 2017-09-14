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
import { md5hash } from '../utils/hash'
import { isSameStringOnUrl } from '../utils/helper'
import logger from '../utils/logger'

export default class DiscoverPage extends React.Component {
  state = {
    profileUrl: ''
  }

  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    logger.info('DiscoverPage query', query)
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user, false)
    const uiStore = initUIStore(isServer)
    let termsInfo = {terms: []}
    let findTerms = []
    let statusCode = !query.profileUrl
    let profileUrl = query.profileUrl ? query.profileUrl : ''
    let currentUser = query.currentUser ? query.currentUser : null
    if (query && query.findTerms) {
      findTerms = query.findTerms
      const termsResult = await DiscoverPage.lockupTerms(findTerms, statusCode, termsInfo)
      logger.info('termsResult', termsResult)
      statusCode = termsResult.statusCode
      termsInfo = termsResult.termsInfo
    }
    const term = initTermStore(isServer, findTerms, termsInfo)
    return { isServer, ...store, ...uiStore, ...term, findTerms, termsInfo, statusCode, profileUrl, currentUser }
  }

  constructor (props) {
    super(props)
    logger.info('Discover', props)
    this.store = initStore(props.isServer, props.userAgent, props.user, false)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.term = initTermStore(props.isServer, props.findTerms, props.termsInfo)
  }

  static async lockupTerms (findTerms, statusCode, termsInfo) {
    if (_.isArray(findTerms)) {
      const lockupTerms = _.map(findTerms, item => `names[]=${item}`).join('&')
      logger.info('fetch URL', `${MAOMAO_API_URL}term/lookup?${lockupTerms}`)
        /* global fetch */
      const res = await fetch(`${MAOMAO_API_URL}term/lookup?${lockupTerms}`)
      const json = await res.json()
      statusCode = res.statusCode > 200 ? res.statusCode : false
      logger.info('fetch json', json)
      termsInfo = json
      if (_.indexOf(termsInfo.terms, null) !== -1 || termsInfo.terms.length !== findTerms.length) {
        statusCode = 404
      }
    } else {
      logger.info('fetch URL', `${MAOMAO_API_URL}term/lookup?names[]=${findTerms}`)
        /* global fetch */
      const res = await fetch(`${MAOMAO_API_URL}term/lookup?names[]=${findTerms}`)
      const json = await res.json()
      statusCode = res.statusCode > 200 ? res.statusCode : false
      logger.info('fetch json', json)
      termsInfo = json
      if (_.indexOf(termsInfo.terms, null) !== -1) {
        statusCode = 404
      }
    }
    return { statusCode, termsInfo }
  }

  componentWillMount () {
    logger.info('DiscoverPage componentWillMount')
    if (this.props.profileUrl) {
      this.setState({ profileUrl: this.props.profileUrl })
    }
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
    const { findTerms, termsInfo } = this.term
    if (this.props.statusCode === false) {
      if (termsInfo.terms && termsInfo.terms.length) {
        logger.info('terms findTerms', termsInfo.terms, findTerms)
        const currentTerm = _.find(termsInfo.terms, item => isSameStringOnUrl(item.term_name, findTerms[findTerms.length - 1]))
        this.store.setTerms(termsInfo.terms)
        if (currentTerm && currentTerm.term_id) {
          this.uiStore.selectDiscoveryTerm(currentTerm.term_id)
          this.term.getTermDiscover(currentTerm.term_id)
        }
      }
      // login for special route
      if (this.state.profileUrl && this.state.profileUrl.length && this.props.currentUser) {
        const { id: userId, fb_user_id: fbUserId, google_user_id: googleUserId } = this.props.currentUser
        const userHash = md5hash(fbUserId || googleUserId)
        this.term.getRootDiscover(userId, userHash, 1)
      }
    }
    logger.info('DiscoverPage componentDidMount', this)
  }

  componentWillReceiveProps (nextProps) {
    // back button on browser logic
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
    logger.info('DiscoverPage componentWillReceiveProps', pathname, query)
    const { findTerms, profileUrl } = query
    if (profileUrl) {
      if (profileUrl !== this.state.profileUrl) {
        this.setState({ profileUrl })
      }
      this.term.setCurrentTerms([])
      this.uiStore.backToRootDiscovery()
      const { userId, userHash } = this.store
      this.term.getRootDiscover(userId, userHash, 1)
    } else if (findTerms) {
      // edge case, term is a string, e.g: mm.rocks/nature
      if (_.isString(findTerms)) {
        this.term.setCurrentTerms([].concat(findTerms))
        const { termsInfo } = this.term
        const currentTerm = _.find(termsInfo.terms, item => isSameStringOnUrl(item.term_name, findTerms))
        logger.info('currentTerm', currentTerm, termsInfo, findTerms)
        if (currentTerm && currentTerm.term_id) {
          this.store.setTerms(termsInfo.terms)
          this.uiStore.selectDiscoveryTerm(currentTerm.term_id)
          this.term.getTermDiscover(currentTerm.term_id)
        }
      } else {
        this.term.setCurrentTerms(findTerms)
        const { termsInfo } = this.term
        const currentTerm = _.find(termsInfo.terms, item => isSameStringOnUrl(item.term_name, findTerms[findTerms.length - 1]))
        logger.info('currentTerm', currentTerm, termsInfo, findTerms)
        if (currentTerm && currentTerm.term_id) {
          this.store.setTerms(termsInfo.terms)
          this.uiStore.selectDiscoveryTerm(currentTerm.term_id)
          this.term.getTermDiscover(currentTerm.term_id)
        }
      }
    }
  }

  render () {
    logger.info('DiscoverPage render', this)
    const { profileUrl } = this.state
    if (this.props.statusCode) {
      return <Error statusCode={this.props.statusCode} />
    }
    return (
      <Provider store={this.store} term={this.term} ui={this.uiStore}>
        <div className='discover'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Discover profileUrl={profileUrl} />
        </div>
      </Provider>
    )
  }
}
