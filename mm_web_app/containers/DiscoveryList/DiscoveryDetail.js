/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'
import InlinePreview from '../../components/Streams/InlinePreview'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'

const DiscoveryNavigation = dynamic(
  import('../../containers/DiscoveryNavigation'),
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
    utc: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    closePreview: PropTypes.func.isRequired,
    onSelectTerm: PropTypes.func.isRequired
  }

  static defaultProps = {
    items: [],
    termIds: [],
    title: '',
    url: '',
    utc: '',
    width: '100%',
    closePreview: () => {},
    onSelectTerm: (term) => {}
  }

  handleClick = (event) => {
    event.preventDefault()
    window.open(this.props.url, '_blank')
  }

  componentWillReact () {
    logger.info('DiscoveryDetail componentWillReact', this.props)
  }

  render () {
    logger.info('DiscoveryDetail render')
    /* eslint-disable camelcase */
    const { items, title, url, utc, termIds, width } = this.props
    const isReady = termIds.length === items.length
    return (
      <div>
        {
          items.length > 0 &&
            <div className='selected-panel'>
              <DiscoveryNavigation
                items={items}
                termIds={termIds}
                isReady={isReady}
                onSelectTerm={this.props.onSelectTerm}
                />
            </div>
          }
        <div className='discovery-detail'>
          <h3><a onClick={this.handleClick}>{title}</a></h3>
          <span>{utc}</span>
        </div>
        <InlinePreview
          width={width}
          height={'100vh'}
          url={url}
          allowScript
          closePreview={this.props.closePreview}
          />
      </div>
    )
  }
}

export default DiscoveryDetail
