/**
*
* YoutubePlayer
*
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'

export default class InlinePreview extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    closePreview: PropTypes.func,
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired
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
    const { url, width, height } = this.props
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
          sandbox='allow-same-origin'
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
