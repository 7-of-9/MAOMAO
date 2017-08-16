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
    main_term_name: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    main_term_img: PropTypes.string.isRequired,
    search_num: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    disc_url_id: 0,
    title: '',
    main_term_name: '',
    img: '',
    main_term_img: '',
    search_num: 0,
    onSelect: (item) => {}
  }

  handleClick = (evt) => {
    evt.preventDefault()
    logger.warn('handleClick')
    this.props.onSelect(this.props)
  }

  render () {
    /* eslint-disable camelcase */
    const { disc_url_id, title, search_num, img, main_term_img, main_term_name } = this.props
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
              className='thumbnail-image'
              onClick={this.handleClick}
              >
              <p className='discovery-title'>{title}</p>
              <div className='caption'>
                <div className='mix-tag'>
                  <div className='mix-tag-topic'>
                    <span
                      style={{
                        background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${main_term_img || '/static/images/no-image.png'})`,
                        backgroundSize: 'cover'
                      }}
                      className={`tags ${tagColor(main_term_name)}`} rel='tag'>
                      {main_term_name}
                    </span>
                  </div>
                </div>
              </div>
            </a>
            <span style={{ fontSize: '11px' }}>S: {search_num} ID: {disc_url_id}</span>
          </div>
        </div>
      </div>
    )
  }
}
