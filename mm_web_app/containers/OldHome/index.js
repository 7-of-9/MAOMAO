/*
 *
 * Home
 *
 */

import React from 'react'
import dynamic from 'next/dynamic'
import { observer, inject } from 'mobx-react'
import Head from 'next/head'
import Raven from 'raven-js'
import _ from 'lodash'
import Loading from '../../components/Loading'
import Layout from '../../components/Layout'
import AddToHome from '../../components/AddToHome'
import logger from '../../utils/logger'

// dynaymic load container component
const Discovery = dynamic(
 import('../Discovery'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const ChromeInstall = dynamic(
 import('../ChromeInstall'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
)

const Share = dynamic(
 import('../Share'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const ShareList = dynamic(
import('../../components/ShareList'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const Streams = dynamic(
import('../../components/Streams'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
)

const TopicTree = dynamic(
import('../../components/TopicTree'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const SelectedPanel = dynamic(
import('../../components/SelectedPanel'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
)

@inject('store')
@inject('ui')
@observer
class OldHome extends React.Component {
  state = {
    hasAddToHome: false
  }

  addToHomeOnMobile = () => {
    logger.info('Home addToHomeOnMobile')
    if (this.props.isMobile) {
      this.addToHome.show(true)
      this.setState({
        hasAddToHome: true
      })
    }
  }

  componentDidMount () {
    logger.info('Home componentDidMount')
    Raven.config('https://85aabb7a13e843c5a992da888d11a11c@sentry.io/191653').install()
    this.props.store.getTopicTree()
    if (this.props.store.userId > 0) {
      this.props.store.getUserHistory()
    }
    if (this.props.isMobile) {
      // TODO: support chrome (android)
      if (window.navigator.standalone) {
        this.setState({
          hasAddToHome: true
        })
      } else {
        /* eslint-disable no-undef */
        this.addToHome = addToHomescreen({
          autostart: false,
          appID: 'org.maomao.webApp',
          detectHomescreen: true,
          startDelay: 0
        })
        logger.info('addToHome', this.addToHome)
      }
    }
  }

  renderViewer = (currentViewer) => {
    switch (currentViewer) {
      case 'share':
        return (<ShareList />)
      case 'sharetopic':
        return (<Share />)
      case 'discovery':
        return (<Discovery />)
      case 'streams':
      default:
        return (<Streams />)
    }
  }

  renderBaseOnAuthentication = () => {
    const { isLogin, isProcessing, shareInfo } = this.props.store
    const { currentViewer, selectedTopics } = this.props.ui
    if (isLogin) {
      return (
        <div className='wrapper-slide'>
          {this.renderViewer(currentViewer)}
          <Loading isLoading={isProcessing} />
        </div>
      )
    }
    const selectedItems = selectedTopics ? _.map(selectedTopics, item => ({img: item.img, id: item.termId, name: item.termName})) : []
    return (
      <div className='wrapper-slide'>
        { shareInfo && <ChromeInstall /> }
        {
          selectedItems.length > 0 &&
          <SelectedPanel
            items={selectedItems}
            />
        }
        {
            currentViewer !== 'discovery' &&
            <TopicTree />
          }
        {
            currentViewer === 'discovery' &&
            <Discovery />
          }
      </div>)
  }

  render () {
    const title = 'maomao - discover & share'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    const { shareInfo, bgImage, isMobile } = this.props.store
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
    const { hasAddToHome } = this.state
    logger.info('Home render', this.props)
    return (
      <Layout title={title} description={description}>
        <Head>
          <meta name='og:image' content={bgImage} />
        </Head>
        { this.renderBaseOnAuthentication() }
        {
          isMobile && !hasAddToHome &&
          <AddToHome onClick={this.addToHomeOnMobile} />
         }
      </Layout>
    )
  }
}

export default OldHome
