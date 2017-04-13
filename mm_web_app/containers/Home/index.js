/*
 *
 * Home
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { inject, observer } from 'mobx-react'
import * as logger from 'loglevel'
import {
  Footer, Hero, HorizontalSplit, Navbar, Page, Section
} from 'neal-react'
import NProgress from 'nprogress'
import Router from 'next/router'

logger.setLevel('info')
Router.onRouteChangeStart = (url) => {
  logger.info(`Loading: ${url}`)
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'Maomao'
const brand = <span>{brandName}</span>

const businessAddress = (
  <address>
    <strong>{brandName}</strong><br />
    Singapore<br />
  </address>
)

@inject('store') @observer
class Home extends React.Component {
  componentWillReact () {
    logger.warn('I will re-render, since the todo has changed!')
  }
  componentDidMount () {
    logger.warn('componentDidMount')
  }
  render () {
    logger.warn('Home', this.props)
    return (
      <Page>
        <Head>
          <title>Maomao - Home page</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <script src='https://npmcdn.com/tether@1.2.4/dist/js/tether.min.js' />
          <script src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js' />
          <script src='https://cdn.rawgit.com/twbs/bootstrap/v4-dev/dist/js/bootstrap.js' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
        </Head>
        <Navbar brand={brand} />
        <Hero className='text-xs-center'>
          <p>Next.js has {this.props.store.stars} ⭐️</p>
        </Hero>
        <Section>
          <HorizontalSplit padding='md'>
            <div>
              <p className='lead'>Batteries Included</p>
              <p>Neal is based on <a href='http://v4-alpha.getbootstrap.com/' target='_blank'>Bootstrap 4</a> and ships with navbar, hero, footer, sections, horizontal split, pricing tables, customer quotes and other components you need for a landing page. No more repetitive coding! Oh, and it's easy to extend.</p>
            </div>
            <div>
              <p className='lead'>Third-Party Integrations</p>
              <p>External integrations like &nbsp;
                <a href='http://www.google.com/analytics/'>Google Analytics</a>,&nbsp;
                <a href='https://segment.com/'>Segment</a>,&nbsp;
                <a href='https://stripe.com/'>Stripe</a> and&nbsp;
                <a href='http://typeform.com'>Typeform</a> are included.
                No more copying & pasting integration code, all you need is your API keys. We automatically track events when visitors navigate to different parts of your page.</p>
            </div>
            <div>
              <p className='lead'>Serverless Deployment</p>
              <p>Because you are relying on react.js and third-party integration you don't need a server to host your landing page. Simply upload it to an Amazon S3 bucket, enable website hosting, and it's ready to go!</p>
            </div>
          </HorizontalSplit>
        </Section>
        <Footer brandName={brandName}
          facebookUrl='http://www.facebook.com'
          twitterUrl='http://www.twitter.com/'
          address={businessAddress}
        />
      </Page>
    )
  }
}

Home.propTypes = {
  history: PropTypes.object,
  home: PropTypes.object,
  loading: PropTypes.bool,
  notifications: PropTypes.object,
  changeNotifications: PropTypes.func,
  inlineInstall: PropTypes.func,
  onChangeTerm: PropTypes.func,
  onChangeFriendStream: PropTypes.func
}

export default Home
