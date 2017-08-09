/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

class TopicItem extends PureComponent {
  static propTypes = {
    topic_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    isSelect: PropTypes.bool.isRequired,
    hasChild: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    topic_id: 0,
    title: '',
    img: '',
    isSelect: false,
    hasChild: true,
    onChange: (isSelect, topicId, title) => {},
    onSelect: (isSelect, topicId, title) => {}
  }

  onChange = (evt) => {
    logger.warn('onChange', evt)
    const { topic_id: topicId, title, isSelect } = this.props
    this.props.onChange(!isSelect, topicId, title)
  }

  handleClick = (evt) => {
    evt.preventDefault()
    logger.warn('handleClick')
    const { hasChild, topic_id: topicId, title, isSelect } = this.props
    if (hasChild) {
      this.props.onSelect(topicId, title)
    }
    if (!isSelect) {
      this.props.onChange(!isSelect, topicId, title)
    }
  }

  render () {
    /* eslint-disable camelcase */
    const { topic_id, title, img, isSelect } = this.props
    logger.warn('TopicItem', topic_id, title, img)
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
              className='thumbnail-image'
              onClick={this.handleClick}
              >
              <div className='caption'>
                <div className='mix-tag'>
                  <div className='mix-tag-topic'>
                    <span className={`tags ${tagColor(title)}`} rel='tag'>
                      {title}
                    </span>
                  </div>
                </div>
              </div>
            </a>
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
