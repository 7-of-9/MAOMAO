import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/invite'
import { initUIStore } from '../stores/ui'
import { initDiscoveryStore } from '../stores/discovery'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update')
  whyDidYouUpdate(React, { exclude: /^(Connect|Provider|DynamicComponent|Index|App|CSSTransitionGroup|NoSSR|BlockElement|Form|Input|DropTarget|DragDropContext|Logo|Page|Section|Head|Footer|Navbar|NavItem|ItemsList|Item|StackedNotification|Notification|AppContainer|Container|ReactStars|ReactTags|DebounceInput|Autosuggest|inject|styled|lifecycle|withState|withHandlers|onlyUpdateForKeys|pure)/ })
}

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

  render () {
    return (
      <Provider store={this.store} discovery={this.discovery} ui={this.uiStore}>
        <div className='invite'>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home />
        </div>
      </Provider>
    )
  }
}
