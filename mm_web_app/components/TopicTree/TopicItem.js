/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'
import eventEmitter from '../../utils/eventEmitter'

class TopicItem extends PureComponent {
  static propTypes = {
    topic_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    childTopics: PropTypes.array.isRequired,
    isSelect: PropTypes.bool.isRequired,
    totals: PropTypes.number.isRequired,
    hasChild: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    topic_id: 0,
    title: '',
    img: '',
    isSelect: false,
    totals: 0,
    hasChild: true,
    childTopics: [],
    onChange: (isSelect, topicId, title, img) => {},
    onSelect: (isSelect, topicId, img) => {}
  }

  onChange = (evt) => {
    logger.warn('onChange', evt)
    const { topic_id: topicId, title, isSelect, img } = this.props
    this.props.onChange(!isSelect, topicId, title, img)
    eventEmitter.emit('carousel', !isSelect)
  }

  handleClick = (evt) => {
    evt.preventDefault()
    logger.warn('handleClick')
    const { hasChild, topic_id: topicId, title, isSelect, img } = this.props
    if (hasChild) {
      this.props.onSelect(topicId, title, img)
      this.props.onChange(!isSelect, topicId, title, img)
      if (!isSelect) {
        eventEmitter.emit('carousel', !isSelect)
      }
    } else {
      this.props.onChange(!isSelect, topicId, title, img)
      if (!isSelect) {
        eventEmitter.emit('carousel', !isSelect)
      }
    }
  }

  renderThumnails = (images) => {
    logger.warn('renderThumnails', images)
    if (images.length > 0) {
      return (
        <div className='preview-child-topics' style={{ width: 'fit-content', position: 'absolute', bottom: '0' }}>
          {images.map(item =>
            <a
              key={`thumbnail-${item.name}`}
              style={{ display: 'inline-block' }}
              data-tooltip={item.name}
              data-position='bottom'
              class='bottom'>
              <img
                style={{width: '25px', height: '25px'}}
                className='thumbnail'
                width='25'
                height='25'
                src={item.img}
                alt={item.name}
                />
            </a>)
          }
        </div>
      )
    }
  }

  render () {
    /* eslint-disable camelcase */
    const { topic_id, title, img, isSelect, totals, childTopics } = this.props
    logger.warn('TopicItem', topic_id, title, img)
    const images = childTopics.map(item => ({img: item.img, name: item.topic_name}))
    return (
      <div key={topic_id} className='grid-item shuffle-item'>
        <div className='thumbnail-box'>
          <div
            className='thumbnail'
            >
            <a
              style={{
                backgroundImage: `url(${img || '/static/images/no-image.png'})`,
                backgroundSize: 'cover'
              }}
              className={isSelect ? 'thumbnail-image active' : 'thumbnail-image'}
              onClick={this.handleClick}
              >
              <div className='caption'>
                <div className='mix-tag'>
                  <div className='mix-tag-topic'>
                    <span
                      style={{
                        background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
                        backgroundSize: 'cover'
                      }}
                      className={`tags ${tagColor(title)}`} rel='tag'>
                      {title}
                    </span>
                    {
                      totals > 0 &&
                      <span className='topic-number'>{totals}</span>
                    }
                  </div>
                </div>
              </div>
            </a>
            {this.renderThumnails(images)}
            <input
              checked={isSelect}
              type='checkbox'
              className='select-topic'
              onChange={this.onChange}
              />
          </div>
        </div>
      </div>
    )
  }
}

export default TopicItem
