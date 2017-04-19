import React from 'react'
import { Provider } from 'mobx-react'
import Discovery from '../containers/Discovery'
import { initStore } from '../stores/discovery'
import stylesheet from '../styles/index.scss'

export default class DiscoveryPage extends React.Component {
  static getInitialProps ({ req, query: { search } }) {
    const isServer = !!req
    let terms = []
    if (search) {
      terms = search.split(',')
    }
    const store = initStore(isServer, terms)
    return { isServer, store, terms }
  }

  constructor (props) {
    super(props)
    this.store = initStore(props.isServer, props.terms)
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
