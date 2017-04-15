import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/invite'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import * as log from 'loglevel'

export default class Invite extends React.Component {
  static getInitialProps ({ req, query: { code, shareInfo } }) {
    const isServer = !!req
    const store = initStore(isServer, code, shareInfo, false)
    return { isServer, ...store }
  }

  constructor (props) {
    super(props)
    log.warn('Invite', props)
    const { query: { close, success } } = props.url
    if ((close && close === 'popup') || (success && Number(success) === 1)) {
      this.isClosePopup = true
    } else {
      this.isClosePopup = false
    }
    this.store = initStore(props.isServer, props.shareCode, props.shareInfo, props.isLogin)
  }

  render () {
    return (
      <Provider store={this.store}>
        <div>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home isClosePopup={this.isClosePopup} />
        </div>
      </Provider>
    )
  }
}
