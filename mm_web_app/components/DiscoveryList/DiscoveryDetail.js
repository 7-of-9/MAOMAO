/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'
import Sticky from 'react-sticky-el'
import InlinePreview from '../Streams/InlinePreview'
import Loading from '../Loading'
import logger from '../../utils/logger'

const DiscoveryNavigation = dynamic(
  import('./DiscoveryNavigation'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
 )

@inject('term')
@inject('store')
@inject('ui')
@observer
class DiscoveryDetail extends PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    utc: PropTypes.string.isRequired
  }

  static defaultProps = {
    items: [],
    title: '',
    url: '',
    utc: ''
  }

  componentWillReact () {
    logger.warn('DiscoveryDetail componentWillReact')
  }

  render () {
    logger.warn('DiscoveryDetail render')
    /* eslint-disable camelcase */
    const { items, title, url, utc } = this.props
    return (
      <div>
        {
        items.length > 0 &&
        <Sticky>
          <div className='selected-panel'>
            <DiscoveryNavigation items={items.map(item => ({ img: item.img, name: item.term_name, id: item.term_id }))} />
          </div>
        </Sticky>
        }
        <h3>{title}</h3>
        <span>{utc}</span>
        <InlinePreview
          width={'100%'}
          height={'100vh'}
          url={url}
          allowScript
      />
      </div>
    )
  }
}

export default DiscoveryDetail
