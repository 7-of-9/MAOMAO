import React from 'react'
import Head from 'next/head'
import { Navbar, Footer, Page } from 'neal-react'
import Raven from 'raven-js'
import logger from '../utils/logger'
import stylesheet from '../styles/index.scss'
import Header from '../components/Header'
import LogoIcon from '../components/LogoIcon'
import Slogan from '../components/Slogan'

const brand = (title, url) => (
  <Header>
    <LogoIcon />
    <Slogan />
    <p>{title} ({url})</p>
  </Header>
)
const brandName = 'maomao'
const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
  </address>
)

export default class Smart extends React.Component {
  state = {
    url: 'https://www.google.com',
    title: 'Google'
  }

  onLoadIframe = (evt) => {
    logger.warn('onLoadIframe', evt, this.iframe)
    if (this.iframe && this.iframe.contentWindow) {
      logger.warn('iframe addEventListener click')
      this.iframe.contentWindow.addEventListener('click', (event) => {
        logger.warn('iframe click', event)
        if (event.target && event.target.tagName === 'A') {
          event.preventDefault()
          const { href: url, innerText: title } = event.target
          this.setState(prevState => ({ url, title }))
        }
      }, false)
      logger.warn('iframe contentWindow.location', this.iframe.contentWindow.location)
    }
  }

  onErrorIframe = (evt) => {
    logger.warn('onErrorIframe', evt, this.iframe)
  }

  openUrlInIframe = (url, name, width = '100%', height = '100%') => {
    const PROXY_URL = '/api/preview'
    const proxyUrl = `${PROXY_URL}?url=${url}`
    return (<iframe
      sandbox='allow-same-origin allow-scripts allow-forms'
      id={`frame-${name}`}
      name={`frame-${name}`}
      ref={(ifr) => { this.iframe = ifr }}
      width={width}
      height={height}
      frameBorder='0'
      allowFullScreen
      allowTransparency
      src={proxyUrl}
      onLoad={this.onLoadIframe}
      onError={this.onErrorIframe}
      />)
  }

  componentDidMount () {
    logger.warn('Smart componentDidMount')
    Raven.config('https://85aabb7a13e843c5a992da888d11a11c@sentry.io/191653').install()
  }

  render () {
    const { url, title } = this.state
    return (
      <Page>
        <Head>
          <meta charSet='utf-8' />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <title>maomao - discover & share</title>
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-title' content='Maomao' />
          <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
          <meta name='google-site-verification' content='AmFFr6xg5Htf_GFkf0psWvL1r9JKBMhGEkmAJ7UmafM' />
          <link rel='apple-touch-icon' href='/static/images/logo.png' />
          <link rel='icon' href='/static/images/logo.png' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <script src='https://code.jquery.com/jquery-3.2.1.slim.min.js' />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
        </Head>
        <div className='smart'>
          <Navbar className='header-nav animated fadeInDown' brand={brand(title, url)} />
          {this.openUrlInIframe(url, title)}
          <div className='footer-area'>
            <Footer brandName={brandName}
              facebookUrl='https://www.facebook.com/maomao.hiring'
              address={businessAddress}
          />
          </div>
        </div>
      </Page>
    )
  }
}
