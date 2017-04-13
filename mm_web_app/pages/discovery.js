import React from 'react'
import Head from 'next/head'
import { Provider } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
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
          <Head>
            <title>Maomao - Discovery page</title>
            <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            <meta name='viewport' content='width=device-width, initial-scale=1' />
            <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
            <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/bricklayer/0.3.2/bricklayer.min.css' />
          </Head>
          <Discovery />
          <DevTools />
        </div>
      </Provider>
    )
  }
  }
