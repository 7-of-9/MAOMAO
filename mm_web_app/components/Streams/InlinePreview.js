/**
*
* YoutubePlayer
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'
import previewUrl from '../../utils/previewUrl'

export default class InlinePreview extends PureComponent {
  static propTypes = {
    url: PropTypes.string.isRequired,
    closePreview: PropTypes.func,
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired
  }

  renderPlayer = () => {
    const { url, width, height } = this.props
    logger.warn('renderPlayer', url, width, height)
    if (!url) {
      return (<Loading isLoading />)
    }
    return (<ReactPlayer
      url={url}
      playsinline
      playing
      width={width || '100%'}
      height={height || '100%'}
      controls
      />)
  }

  renderIframe = () => {
    const { url, width, height } = this.props
    if (!url) {
      return (<Loading isLoading />)
    }
    logger.warn('renderIframe', url, width, height)
    return previewUrl(url, url, width, height)
  }

  render () {
    const { url } = this.props
    return (
      <div className='grid-item--full'>
        <div className='close_button' onClick={this.props.closePreview} />
        {
          (
            url.indexOf('vimeo.com') !== -1 ||
            url.indexOf('youtube.com') !== -1
          ) &&
          this.renderPlayer()
          }
        {
        (
          url.indexOf('vimeo.com') === -1 &&
          url.indexOf('youtube.com') === -1
        ) &&
        this.renderIframe()
        }
      </div>
    )
  }
}
