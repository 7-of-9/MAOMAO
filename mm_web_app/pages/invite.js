import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/invite'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'
import * as log from 'loglevel'

export default class Invite extends React.Component {
  static getInitialProps ({ req, query: { code } }) {
    const isServer = !!req
    const store = initStore(isServer, code, false, false)
    return { isServer, code, isLogin: store.isLogin, isInstall: store.isInstall }
  }

  constructor (props) {
    super(props)
    log.warn('Invite props', props)
    this.store = initStore(props.isServer, props.code, props.isLogin, props.isInstall)
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
