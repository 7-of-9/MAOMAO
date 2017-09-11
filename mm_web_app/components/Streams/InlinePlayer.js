/**
*
* YoutubePlayer
*
*/

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import ReactPlayer from 'react-player'
import _ from 'lodash'
import eventEmitter from '../../utils/eventEmitter'
import logger from '../../utils/logger'

@inject('ui')
@observer
class InlinePlayer extends Component {
  state = {
    hasHover: false,
    isPlaying: false
  }

  onReady = () => {
    eventEmitter.emit('layout')
  }
  onError = (err) => {
    logger.warn('onError', err)
    eventEmitter.emit('layout')
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  handleClick = (event) => {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      window.open(this.props.href, '_blank')
    } else {
      this.props.onPreview(this.props.href)
      eventEmitter.emit('layout')
    }
  }

  renderThumbnailImage = () => {
    /* eslint-disable camelcase */
    const { title, img, url_id, topics, myUrlIds, deepestTopics, urlTopic, urlOwner, owners, users } = this.props
    return (
      <div className='thumbnail-image'>
        <img
          src={img || '/static/images/no-image.png'}
          alt={title}
          height={230}
          onError={this.noImage}
          />
        {urlTopic(url_id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(url_id, topic, deepestTopics))}
        {urlOwner(_.filter(owners, item => item.url_id === url_id), users, (user) => this.props.ui.selectUser(user))}
      </div>
    )
  }

  renderTitle = () => {
    /* eslint-disable camelcase */
    const { href, title, url_id, parseDomain } = this.props
    return (
      <div className='caption'>
        <h4 className='caption-title'>
          <a onClick={this.handleClick}>
            {title} ({url_id})
              </a>
        </h4>
        <h5 className='caption-title'>{parseDomain(href)}</h5>
      </div>
    )
  }

  renderYoutubeFrame = () => {
    const { isPlaying } = this.state
    const { href, url_id, topics, owners, users, myUrlIds, deepestTopics, urlTopic, urlOwner } = this.props
    return (
      <div className='thumbnail-image'>
        <ReactPlayer
          ref={player => { this.player = player }}
          url={href}
          onReady={this.onReady}
          onError={this.onError}
          volume={0}
          playsinline
          playing={isPlaying}
          width={'100%'}
          height={'100%'}
          controls
      />
        {urlTopic(url_id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(url_id, topic, deepestTopics))}
        {urlOwner(_.filter(owners, item => item.url_id === url_id), users, (user) => this.props.ui.selectUser(user))}
      </div>)
  }

  onMouseEnter = (evt) => {
    this.setState({
      hasHover: true,
      isPlaying: true
    })
  }

  onMouseLeave = (evt) => {
    this.setState({
      isPlaying: false
    })
  }

  render () {
    /* eslint-disable camelcase */
    const { hasHover } = this.state
    return (
      <div className='thumbnail'
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        >
        { hasHover && this.renderYoutubeFrame() }
        { !hasHover && this.renderThumbnailImage() }
        { this.renderTitle() }
      </div>
    )
  }
}

export default InlinePlayer
