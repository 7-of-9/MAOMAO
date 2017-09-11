/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'
import eventEmitter from '../../utils/eventEmitter'

class TopicItem extends PureComponent {
  static propTypes = {
    term_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    childTopics: PropTypes.array.isRequired,
    selectedTopics: PropTypes.array.isRequired,
    isSelect: PropTypes.bool.isRequired,
    totals: PropTypes.number.isRequired,
    hasChild: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    selectChildTopics: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    term_id: 0,
    title: '',
    img: '',
    isSelect: false,
    totals: 0,
    hasChild: true,
    childTopics: [],
    selectedTopics: [],
    onChange: (isSelect, termId, title, img) => {},
    onSelect: (isSelect, termId, img) => {},
    selectChildTopics: (topics) => {}
  }

  onChange = (evt) => {
    logger.warn('onChange', evt)
    const { term_id: termId, title, isSelect, img } = this.props
    this.props.onChange(!isSelect, termId, title, img)
    eventEmitter.emit('carousel', !isSelect)
  }

  handleClick = (evt) => {
    evt.preventDefault()
    logger.warn('handleClick')
    const { hasChild, childTopics, term_id: termId, title, isSelect, img } = this.props
    if (hasChild) {
      this.props.onSelect(termId, title, img)
      if (!isSelect) {
        this.props.onChange(!isSelect, termId, title, img)
      }
      this.props.selectChildTopics(childTopics)
      eventEmitter.emit('carousel', !isSelect)
    } else {
      this.props.onChange(!isSelect, termId, title, img)
      if (!isSelect) {
        eventEmitter.emit('carousel', !isSelect)
      }
    }
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  renderThumnails = (images) => {
    logger.warn('renderThumnails', images)
    if (images.length > 0) {
      return (
        <div className='preview-child-topics' style={{ width: 'fit-content', position: 'absolute', bottom: '0' }}>
          {_.map(images, item =>
            <a
              key={`thumbnail-${item.name}`}
              style={{ display: 'inline-block' }}
              data-tooltip={item.name}
              data-position='bottom'
              className='bottom'>
              <img
                style={{width: '25px', height: '25px'}}
                className='thumbnail'
                width='25'
                height='25'
                onError={this.noImage}
                src={item.img}
                alt={item.name}
                />
            </a>)
          }
        </div>
      )
    }
  }

  hasSelected = (childTopics, topics) => {
    const termIds = _.map(childTopics, item => item.term_id)
    const isSelected = topics.length > 0 && _.find(topics, item => termIds.indexOf(item.termId) !== -1)
    return isSelected ? 'topic-number has-selected' : 'topic-number'
  }

  render () {
    /* eslint-disable camelcase */
    const { term_id, title, img, isSelect, totals, childTopics, selectedTopics } = this.props
    logger.warn('TopicItem', term_id, title, img)
    const images = _.map(childTopics, item => ({img: item.img, name: item.term_name}))
    return (
      <div key={term_id} className='grid-item shuffle-item'>
        <div className='thumbnail-box'>
          <div
            className='thumbnail'
            >
            <a
              style={{
                backgroundImage: `url(${img || '/static/images/no-image.png'})`,
                backgroundSize: 'cover',
                opacity: '1.0'
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
                      <span className={this.hasSelected(childTopics, selectedTopics)}>{totals}</span>
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
