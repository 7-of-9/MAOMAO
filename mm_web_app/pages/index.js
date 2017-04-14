import React from 'react'
import { Provider } from 'mobx-react'
import * as logger from 'loglevel'
import { initStore } from '../stores/home'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'

export default class HomePage extends React.Component {
  static getInitialProps ({ req }) {
    const isServer = !!req
    const store = initStore(isServer, false, false)
    logger.warn('HomePage getInitialProps')
    return { isServer, ...store }
  }

  constructor (props) {
    super(props)
    this.store = initStore(props.isServer, props.isLogin, props.isInstall)
  }

  render () {
    return (
      <Provider store={this.store}>
        <div>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Home />
        </div>
      </Provider>
    )
  }
}
