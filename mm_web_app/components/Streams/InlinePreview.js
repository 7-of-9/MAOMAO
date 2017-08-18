/**
*
* YoutubePlayer
*
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import urlParser from 'js-video-url-parser'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'

export default class InlinePreview extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    closePreview: PropTypes.func,
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    allowScript: PropTypes.bool.isRequired
  }

  static defaultProps = {
    url: '',
    closePreview: () => {},
    width: '100%',
    height: '100%',
    allowScript: false
  }

  state = {
    isLoading: false
  }

  renderPlayer = () => {
    const { url, width, height } = this.props
    logger.warn('renderPlayer', url, width, height)
    if (!url) {
      return (
        <div
          style={{backgroundColor: '#fff', width: width || '100%', height: height || '100%'}}
        >
          <Loading isLoading />
        </div>)
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

  onLoadIframe = () => {
    logger.warn('iframe', this.iframe)
    this.setState({isLoading: false})
  }

  renderIframe = () => {
    const { url, width, height, allowScript } = this.props
    const { isLoading } = this.state
    logger.warn('renderIframe', url, width, height)
    if (!url) {
      return (
        <div
          style={{backgroundColor: '#fff', width: width || '100%', height: height || '100%'}}
        >
          <Loading isLoading />
        </div>)
    }
    const PROXY_URL = '/api/preview'
    const proxyUrl = `${PROXY_URL}?url=${url}`
    return (
      <div
        style={{backgroundColor: '#fff', width: width || '100%', height: height || '100%'}}
        >
        <Loading isLoading={isLoading} />
        <iframe
          className={isLoading ? 'hidden-view' : 'iframe-view'}
          sandbox={allowScript ? 'allow-same-origin allow-scripts allow-forms allow-presentation allow-popups' : 'allow-same-origin allow-forms allow-presentation allow-popups'}
          id={`frame-${url}`}
          name={`frame-${url}`}
          ref={(iframe) => { this.iframe = iframe }}
          onLoad={this.onLoadIframe}
          width={width}
          height={height}
          frameBorder='0'
          allowFullScreen
          allowTransparency
          src={proxyUrl}
        />
      </div>
    )
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.url !== this.props.url && !this.state.isLoading) {
      this.setState({isLoading: true})
    }
  }

  render () {
    const { url } = this.props
    const parsed = urlParser.parse(url)
    logger.warn('video parse result', parsed)
    const isVideoPlayer = !!parsed
    logger.warn('isVideoPlayer', isVideoPlayer)
    return (
      <div className='grid-item--full'>
        <div className='close_button' onClick={this.props.closePreview} />
        {
          isVideoPlayer &&
          this.renderPlayer()
        }
        {
          !isVideoPlayer &&
          this.renderIframe()
        }
      </div>
    )
  }
}
