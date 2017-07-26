/**
*
* StreamItem
*
*/

import React, { Component } from 'react'

class TopicItem extends Component {
  state = {
    isSelect: false
  }

  handleClick = (evt) => {
    evt.preventDefault()
    this.setState(currentState => ({ isSelect: !currentState.isSelect }))
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  render () {
    /* eslint-disable camelcase */
    const { topic_id, title, img } = this.props
    const { isSelect } = this.state
    return (
      <div key={topic_id} className='grid-item shuffle-item'>
        <div className='thumbnail-box'>
          <div className='thumbnail'>
            <div className='thumbnail-image'>
              <a className='thumbnail-overlay' onClick={this.handleClick}>
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
              </a>
            </div>
            <div className='caption'>
              <h4 className='caption-title'>
                <a onClick={this.handleClick}>
                  {title} ({topic_id})
                </a>
              </h4>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TopicItem
