import React from 'react'
import { Provider } from 'mobx-react'
// import DevTools from 'mobx-react-devtools'
import { initStore } from '../stores/home'
import Home from '../containers/Home'
import stylesheet from '../styles/index.scss'

export default class HomePage extends React.Component {
  static getInitialProps ({ req }) {
    const isServer = !!req
    const store = initStore(isServer)
    return { lastUpdate: store.lastUpdate, isServer }
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
          <Home />
          {/* <DevTools /> */}
        </div>
      </Provider>
    )
  }
}
