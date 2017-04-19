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
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const store = initStore(isServer, userAgent, terms)
    return { isServer, ...store }
  }

  constructor (props) {
    super(props)
    this.store = initStore(props.isServer, props.userAgent, props.terms)
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
