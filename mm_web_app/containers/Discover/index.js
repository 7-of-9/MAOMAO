/*
 *
 * Home
 *
 */

import React from 'react'
import { observer, inject } from 'mobx-react'
import Raven from 'raven-js'
import DiscoveryList from '../../containers/DiscoveryList'
import Layout from '../../components/Layout'
import logger from '../../utils/logger'

@inject('term')
@inject('store')
@inject('ui')
@observer
class Discover extends React.Component {
  componentDidMount () {
    logger.info('Discover componentDidMount', this.props)
    Raven.config('https://85aabb7a13e843c5a992da888d11a11c@sentry.io/191653').install()
  }

  render () {
    const title = 'maomao - discover & share'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    logger.info('Discover render', this.props)
    return (
      <Layout title={title} description={description}>
        <div className='wrapper-slide'>
          <DiscoveryList {...this.props} />
        </div>
      </Layout>
    )
  }
}

export default Discover
