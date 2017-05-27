/*
 *
 * Home
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import Head from 'next/head'
import Router from 'next/router'
import NoSSR from 'react-no-ssr'
import { NotificationStack } from 'react-notification'
import { Footer, Page, Section } from 'neal-react'
import ToggleDisplay from 'react-toggle-display'
import NProgress from 'nprogress'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../AppHeader'
import Streams from '../Streams'
import ChromeInstall from '../ChromeInstall'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'maomao'
const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
  </address>
)

@inject('store')
@inject('ui')
@observer
class Home extends React.Component {
  constructor (props) {
    super(props)
    this.onInstallSucess = this.onInstallSucess.bind(this)
    this.onInstallFail = this.onInstallFail.bind(this)
    this.inlineInstall = this.inlineInstall.bind(this)
    this.addNotification = this.addNotification.bind(this)
    this.removeNotification = this.removeNotification.bind(this)
  }

  onInstallSucess () {
    this.props.ui.addNotification('Yeah! You have been installed maomao extension successfully.')
    setTimeout(() => {
      window.location.reload()
      this.props.store.checkEnvironment()
    }, 1000)
  }

  onInstallFail (error) {
    this.props.addNotification(error)
  }

  addNotification (msg) {
    this.props.ui.addNotification(msg)
  }

  inlineInstall () {
      /* eslint-disable */
      chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
      this.onInstallSucess,
      this.onInstallFail)
      /* eslint-enable */
  }

  removeNotification (uuid) {
    this.props.ui.removeNotification(uuid)
  }

  componentDidMount () {
      // TODO: filter by invite user
    logger.warn('Home componentDidMount')
  }

  componentWillReact () {
    logger.warn('Home componentWillReact')
  }

  render () {
    const title = 'maomao - peer-to-peer real time content sharing network'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    const { isLogin, isProcessing, isMobile, shareInfo, bgImage } = this.props.store
    if (shareInfo) {
      const { fullname, share_all: shareAll, topic_title: topicTitle, url_title: urlTitle } = shareInfo
      if (shareAll) {
        description = `${fullname} would like to share all maomao stream with you`
      } else if (urlTitle && urlTitle.length) {
        description = `${fullname} would like to share "${urlTitle}" with you`
      } else if (topicTitle && topicTitle.length) {
        description = `${fullname} would like to share the maomao stream with you: "${topicTitle}"`
      }
    }
    return (
      <Page>
        <Head>
          <meta charSet='utf-8' />
          <title>{title}</title>
          <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
          <meta name='description' content={description} />
          <meta name='og:title' content={title} />
          <meta name='og:description' content={description} />
          <meta name='og:image' content={bgImage && bgImage.length > 0 ? bgImage : `${MAOMAO_SITE_URL}static/images/logo.png`} />
          <meta name='fb:app_id' content={FACEBOOK_APP_ID} />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <script src='https://code.jquery.com/jquery-3.1.1.slim.min.js' />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
        </Head>
        <AppHeader notify={this.addNotification} />
        <NotificationStack
          notifications={this.props.ui.notifications.toArray()}
          dismissAfter={5000}
          onDismiss={(notification) => this.props.ui.notifications.remove(notification)}
        />
        <ToggleDisplay if={!isLogin}>
          {
          !isMobile &&
          <NoSSR onSSR={<Loading isLoading />}>
            <ChromeInstall
              description={description}
              title='Unlock YOUR FRIEND STREAM Now'
              install={this.inlineInstall}
            />
          </NoSSR>
        }
          <Section className='section-list' style={{ backgroundColor: '#fff', padding: '2rem 0' }}>
            <div className='section-item'>
              <h3 className='lead'>What is <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' />?</h3>
              <p><img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> is a solution for friends to automatically share content with each other on a specific topic of shared interest.</p>
              <p>For example, I might share <strong>US Politics</strong> and <strong>Global Tech > Startups</strong> with one work colleague, <strong>Software > Agile</strong> and <strong>Music > Kpop</strong> with a different work colleague; <strong>Medical Music > Classical Music</strong> with an elderly parent. The permutations are uniquely personalised between peers in the <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> social graph.</p>
              <p><img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> overcomes distance and communication barriers: it amplifies enjoyment and consumption of high quality web content, using AI to let friends rediscover and enjoy content from each other in real time, no matter where they are and <strong>without any effort or input</strong> from each other.</p>
              <p>It’s a radical reimagining of what sharing can be, always in the complete control of users: it’s safe, automatic and intelligent, highlighting only the best and most relevant content to friends.</p>
              <p>Because <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> learns intimately each user’s unique preferences and likes, it also surfaces new and contextually related parts of the internet for users. It’s like a smart, <strong>personalised and proactive search engine.</strong></p>
            </div>
            <div className='section-item'>
              <h3 className='lead'>How does it work?</h3>
              <p>We use natural language processing, correlation analysis and a real time learning engine to categorise web content as it is browsed. We suggest and then setup real time topic sharing between users on the platform, so users can view each others topic streams - both past and future content is automatically shared once both users accept the shared stream.</p>
            </div>
            <div className='section-item'>
              <h3 className='lead'>What stage are we at?</h3>
              <p>We are in stealth mode, and developing towards private alpha testing phase. We have and end-to-end technical proof of concept in place, working on desktop web.</p>
            </div>
            <div className='section-item'>
              <h3 className='lead'>Who are we?</h3>
              <p><img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> is founded by a lifelong technologist with twenty years experience: from global tech and finance giants through to most recently an fin-tech startup that attracted several rounds of tier-one Silicon Valley VC investment. Our distributed development team is in APAC region.</p>
            </div>
          </Section>
        </ToggleDisplay>
        <ToggleDisplay if={isLogin}>
          { !isMobile &&
          <NoSSR onSSR={<Loading isLoading />}>
            <ChromeInstall
              description={description}
              title='Unlock YOUR FRIEND STREAM Now'
              install={this.inlineInstall}
          />
          </NoSSR>
        }
          <Loading isLoading={isProcessing} />
          <Streams />
        </ToggleDisplay>
        <div className='footer-area'>
          <Footer brandName={brandName}
            facebookUrl='https://www.facebook.com/maomao.hiring'
            address={businessAddress}
          />
        </div>
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
