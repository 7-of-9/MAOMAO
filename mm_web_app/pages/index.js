import React from 'react'
import { Provider, observer } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update')
  whyDidYouUpdate(React, { exclude: /^(Connect|Provider|Index|App|NoSSR|Page|Section|Head|Footer|Navbar|NavItem|ItemsList|Item|StackedNotification|Notification|AppContainer|Container|ReactStars|DebounceInput|Autosuggest|inject|styled|lifecycle|withState|withHandlers|onlyUpdateForKeys|pure)/ })
}

@observer
export default class Index extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user)
    const uiStore = initUIStore(isServer)
    return { isServer, ...store, ...uiStore }
  }

  constructor (props) {
    super(props)
    logger.warn('Index', props)
    this.store = initStore(props.isServer, props.userAgent, props.user)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.store.checkInstall()
  }

  render () {
    return (
      <Provider store={this.store} ui={this.uiStore}>
        <div className='home'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home />
        </div>
      </Provider>
    )
  }
}
