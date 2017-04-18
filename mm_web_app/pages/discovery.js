import React from 'react'
import { Provider } from 'mobx-react'
import Discovery from '../containers/Discovery'
import { initStore } from '../stores/discovery'
import stylesheet from '../styles/index.scss'

export default class DiscoveryPage extends React.Component {
  static getInitialProps ({ req }) {
    const isServer = !!req
    const store = initStore(isServer)
    return { isServer, store }
  }

  constructor (props) {
    super(props)
    this.store = initStore(props.isServer)
  }

  render () {
    return (
      <Provider store={this.store}>
        <div>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Discovery />
        </div>
      </Provider>
    )
  }
  }
