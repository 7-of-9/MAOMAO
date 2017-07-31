/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import logger from '../../utils/logger'

class TopicItem extends PureComponent {
  static propTypes = {
    topic_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    isSelect: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  }

  static defaultProps = {
    topic_id: 0,
    title: '',
    img: '',
    isSelect: false,
    onChange: (isSelect, topicId, title) => {}
  }

  onChange = (evt) => {
    logger.warn('onChange', evt)
    const { topic_id: topicId, title, isSelect } = this.props
    this.props.onChange(!isSelect, topicId, title)
  }

  handleClick = (evt) => {
    evt.preventDefault()
    logger.warn('handleClick')
    const { topic_id: topicId, title, isSelect } = this.props
    this.props.onChange(!isSelect, topicId, title)
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  render () {
    /* eslint-disable camelcase */
    const { topic_id, title, img, isSelect } = this.props
    return (
      <div key={topic_id} className='grid-item shuffle-item'>
        <div className='thumbnail-box'>
          <div className='thumbnail'>
            <a className='thumbnail-image' onClick={this.handleClick}>
              <img
                src={img || '/static/images/no-image.png'}
                alt={title}
                onError={this.noImage}
                  />
              <div className='caption'>
                <h4>{title}</h4>
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
