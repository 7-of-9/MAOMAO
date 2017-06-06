import React from 'react'
import { Provider, observer } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initDiscoveryStore } from '../stores/discovery'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update')
  whyDidYouUpdate(React, { exclude: /^(Connect|Provider|DynamicComponent|Motion|Index|App|CSSTransitionGroup|NoSSR|BlockElement|Form|Input|DropTarget|DragDropContext|Logo|Page|Section|Head|Footer|Navbar|NavItem|ItemsList|Item|StackedNotification|Notification|AppContainer|Container|ReactStars|ReactTags|DebounceInput|Autosuggest|Step|Modal|CopyToClipboard|inject|styled|lifecycle|withState|withHandlers|onlyUpdateForKeys|pure)/ })
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
    this.store = initStore(props.isServer, props.userAgent, props.user)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.discovery = initDiscoveryStore(props.isServer, props.userAgent, props.user, props.terms)
  }

  render () {
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
