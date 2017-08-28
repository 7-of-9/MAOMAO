/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
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

@observer
class DiscoveryDetail extends PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired,
    termIds: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    utc: PropTypes.string.isRequired
  }

  static defaultProps = {
    items: [],
    termIds: [],
    title: '',
    url: '',
    utc: ''
  }

  handleClick = (event) => {
    event.preventDefault()
    window.open(this.props.url, '_blank')
  }

  componentWillReact () {
    logger.warn('DiscoveryDetail componentWillReact', this.props)
  }

  render () {
    logger.warn('DiscoveryDetail render')
    /* eslint-disable camelcase */
    const { items, title, url, utc, termIds } = this.props
    const isReady = termIds.length === items.length
    return (
      <div style={{height: '100vh'}}>
        {
        items.length > 0 &&
        <Sticky>
          <div className='selected-panel'>
            <DiscoveryNavigation
              items={items.map(item => ({ img: item.img, name: item.term_name, id: item.term_id }))}
              termIds={termIds}
              isReady={isReady}
              />
          </div>
        </Sticky>
        }
        <h3><a onClick={this.handleClick}>{title}</a></h3>
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
