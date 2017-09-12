/*
 *
 * Home
 *
 */

import React from 'react'
import { observer, inject } from 'mobx-react'
import Raven from 'raven-js'
import Layout from '../../components/Layout'
import DiscoveryList from '../../containers/DiscoveryList'
import logger from '../../utils/logger'

@inject('term')
@inject('store')
@inject('ui')
@observer
class Discover extends React.PureComponent {
  renderRootDiscover = () => {
    return (
      <div className='wrapper-slide'>
        <DiscoveryList />
      </div>
    )
  }

  componentDidMount () {
    logger.info('Discover componentDidMount', this.props)
    Raven.config('https://85aabb7a13e843c5a992da888d11a11c@sentry.io/191653').install()
    this.props.store.getTopicTree()
  }

  render () {
    const title = 'maomao - discover & share'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    logger.info('Discover render', this.props)
    return (
      <Layout title={title} description={description}>
        {this.renderRootDiscover()}
      </Layout>
    )
  }
}

export default Discover
