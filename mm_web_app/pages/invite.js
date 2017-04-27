import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/invite'
import { initUIStore } from '../stores/ui'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'

export default class Invite extends React.Component {
  static getInitialProps ({ req, query: { code, shareInfo } }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const store = initStore(isServer, userAgent, code, shareInfo)
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
    this.uiStore = initUIStore(props.isServer)
    this.store = initStore(props.isServer, props.userAgent, props.shareCode, props.shareInfo)
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
