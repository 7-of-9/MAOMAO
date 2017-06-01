import React from 'react'
import { Provider } from 'mobx-react'
import Discovery from '../containers/Discovery'
import { initDiscoveryStore } from '../stores/discovery'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update')
  whyDidYouUpdate(React, { exclude: /^(Connect|Provider|Index|App|CSSTransitionGroup|NoSSR|Page|Section|Head|Footer|Navbar|NavItem|ItemsList|Item|StackedNotification|Notification|AppContainer|Container|ReactStars|DebounceInput|Autosuggest|inject|styled|lifecycle|withState|withHandlers|onlyUpdateForKeys|pure)/ })
}

export default class DiscoveryPage extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    logger.warn('user', user)
    let terms = []
    const { search } = query
    if (search) {
      terms = search.split(',')
    }
    logger.warn('terms', terms)

    const discovery = initDiscoveryStore(isServer, userAgent, user, terms)
    return { isServer, ...discovery }
  }

  constructor (props) {
    super(props)
    this.discovery = initDiscoveryStore(props.isServer, props.userAgent, props.user, props.terms)
  }

  render () {
    return (
      <Provider discovery={this.discovery}>
        <div className='discovery'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Discovery terms={this.props.terms} />
        </div>
      </Provider>
    )
  }
  }
