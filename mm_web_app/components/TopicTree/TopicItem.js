/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import logger from '../../utils/logger'

@inject('ui')
@observer
class TopicItem extends PureComponent {
  static propTypes = {
    topic_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired
  }

  static defaultProps = {
    topic_id: 0,
    title: '',
    img: ''
  }

  handleClick = (evt) => {
    evt.preventDefault()
    const { topic_id: topicId, title } = this.props
    const isSelect = this.props.ui.selectedTopics.find(item => item.topicId === topicId)
    logger.warn('toggle select isSelect', topicId, title, !isSelect)
    this.props.ui.toggleSelectTopic(!isSelect, topicId, title)
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  render () {
    /* eslint-disable camelcase */
    const { topic_id, title, img } = this.props
    const isSelect = this.props.ui.selectedTopics.find(item => item.topicId === topic_id)
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
              <input
                checked={isSelect}
                type='checkbox'
                className='select-topic'
                onChange={this.handleClick}
                 />
              <div className='caption'>
                <h4 onClick={this.handleClick} >
                  {title}
                </h4>
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default TopicItem
