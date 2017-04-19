import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/home'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'

export default class HomePage extends React.Component {
  static getInitialProps ({ req }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const store = initStore(isServer, userAgent)
    return { isServer, ...store }
  }

  constructor (props) {
    super(props)
    const { query: { close, success } } = props.url
    if ((close && close === 'popup') || (success && Number(success) === 1)) {
      this.isClosePopup = true
    } else {
      this.isClosePopup = false
    }
    this.store = initStore(props.isServer, props.userAgent)
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
