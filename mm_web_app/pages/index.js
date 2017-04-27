import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

export default class HomePage extends React.Component {
  static async getInitialProps ({ req, query }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    logger.warn('user', user)
    const store = initStore(isServer, userAgent, user)
    const uiStore = initUIStore(isServer)
    return { isServer, ...store, ...uiStore }
  }

  constructor (props) {
    super(props)
    const { query: { close, success } } = props.url
    if ((close && close === 'popup') || (success && Number(success) === 1)) {
      this.isClosePopup = true
    } else {
      this.isClosePopup = false
    }
    this.store = initStore(props.isServer, props.userAgent, props.user)
    this.uiStore = initUIStore(props.isServer)
  }

  render () {
    return (
      <Provider store={this.store} ui={this.uiStore}>
        <div>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home isClosePopup={this.isClosePopup} />
        </div>
      </Provider>
    )
  }
}
