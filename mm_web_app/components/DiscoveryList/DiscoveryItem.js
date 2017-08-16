/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

export default class DiscoveryItem extends PureComponent {
  static propTypes = {
    disc_url_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired
  }

  static defaultProps = {
    disc_url_id: 0,
    title: '',
    img: ''
  }

  handleClick = (evt) => {
    evt.preventDefault()
    logger.warn('handleClick')
  }

  render () {
    /* eslint-disable camelcase */
    const { disc_url_id, title, img, isSelect } = this.props
    return (
      <div key={disc_url_id} className='grid-item shuffle-item'>
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
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  }
}
