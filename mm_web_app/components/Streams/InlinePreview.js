/**
*
* YoutubePlayer
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import logger from '../../utils/logger'
import previewUrl from '../../utils/previewUrl'

export default class InlinePreview extends PureComponent {
  static propTypes = {
    url: PropTypes.string.isRequired
  }

  renderPlayer = () => {
    const {url} = this.props
    return (<ReactPlayer
      url={url}
      playsinline
      playing
      width={'100%'}
      height={'100%'}
      controls
      />)
  }

  renderIframe = () => {
    const { url } = this.props
    return previewUrl(url, url)
  }

  render () {
    const { url } = this.props
    logger.warn('currentUrl', url)
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
