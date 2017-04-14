import React from 'react'
import Head from 'next/head'
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
          <Head>
            <title>Maomao - Discovery page</title>
            <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            <meta name='viewport' content='width=device-width, initial-scale=1' />
            <link rel='apple-touch-icon' sizes='57x57' href='/static/favicon/apple-icon-57x57.png' />
            <link rel='apple-touch-icon' sizes='60x60' href='/static/favicon/apple-icon-60x60.png' />
            <link rel='apple-touch-icon' sizes='72x72' href='/static/favicon/apple-icon-72x72.png' />
            <link rel='apple-touch-icon' sizes='76x76' href='/static/favicon/apple-icon-76x76.png' />
            <link rel='apple-touch-icon' sizes='114x114' href='/static/favicon/apple-icon-114x114.png' />
            <link rel='apple-touch-icon' sizes='120x120' href='/static/favicon/apple-icon-120x120.png' />
            <link rel='apple-touch-icon' sizes='144x144' href='/static/favicon/apple-icon-144x144.png' />
            <link rel='apple-touch-icon' sizes='152x152' href='/static/favicon/apple-icon-152x152.png' />
            <link rel='apple-touch-icon' sizes='180x180' href='/static/favicon/apple-icon-180x180.png' />
            <link rel='icon' type='image/png' sizes='192x192' href='/static/favicon/android-icon-192x192.png' />
            <link rel='icon' type='image/png' sizes='32x32' href='/static/favicon/favicon-32x32.png' />
            <link rel='icon' type='image/png' sizes='96x96' href='/static/favicon/favicon-96x96.png' />
            <link rel='icon' type='image/png' sizes='16x16' href='/static/favicon/favicon-16x16.png' />
            <link rel='manifest' href='/static/favicon/manifest.json' />
            <meta name='msapplication-TileColor' content='#ffffff' />
            <meta name='msapplication-TileImage' content='/static/favicon/ms-icon-144x144.png' />
            <meta name='theme-color' content='#ffffff' />
            <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
            <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/bricklayer/0.3.2/bricklayer.min.css' />
          </Head>
          <Discovery />
        </div>
      </Provider>
    )
  }
  }
