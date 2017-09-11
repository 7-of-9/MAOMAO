/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

const dynamicFontSize = (text) => {
  if (text.length > 20) return '0.8rem'
  if (text.length > 12) return '1rem'
  return '1.5rem'
}

@observer
export default class DiscoveryItem extends PureComponent {
  static propTypes = {
    disc_url_id: PropTypes.number.isRequired,
    main_term_id: PropTypes.number.isRequired,
    sub_term_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    main_term_name: PropTypes.string.isRequired,
    sub_term_name: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    main_term_img: PropTypes.string.isRequired,
    sub_term_img: PropTypes.string.isRequired,
    search_num: PropTypes.number.isRequired,
    ingoreTerms: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectTerm: PropTypes.func.isRequired
  }

  static defaultProps = {
    disc_url_id: 0,
    main_term_id: 0,
    sub_term_id: 0,
    title: '',
    desc: '',
    main_term_name: '',
    sub_term_name: '',
    img: '',
    main_term_img: '',
    sub_term_img: '',
    search_num: 0,
    ingoreTerms: [],
    onSelect: (item) => {},
    onSelectTerm: (termId) => {}
  }

  handleClick = (evt) => {
    evt.preventDefault()
    if (!this.clickOnTerm) {
      logger.warn('handleClick', evt.target)
      this.props.onSelect(this.props)
    }
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  selectMainTerm = (evt) => {
    evt.preventDefault()
    const { main_term_id } = this.props
    logger.warn('selectMainTerm', main_term_id, evt.target)
    this.clickOnTerm = true
    this.props.onSelectTerm(main_term_id)
  }

  selectSubTerm = (evt) => {
    evt.preventDefault()
    const { sub_term_id } = this.props
    logger.warn('selectSubTerm', sub_term_id, evt.target)
    this.clickOnTerm = true
    this.props.onSelectTerm(sub_term_id)
  }

  renderTerms = () => {
    /* eslint-disable camelcase */
    const { main_term_img, main_term_name, sub_term_img, sub_term_name, main_term_id, sub_term_id, ingoreTerms } = this.props
    let customStyle = { height: '52px' }
    if (sub_term_name !== main_term_name) {
      customStyle = Object.assign({}, customStyle, { top: '-15px' })
    }
    return (
      <div className='mix-tag' style={customStyle}>
        <div className='mix-tag-topic' onClick={this.selectMainTerm}>
          <span
            style={{
              background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${main_term_img || '/static/images/no-image.png'})`,
              backgroundSize: 'cover',
              fontSize: dynamicFontSize(main_term_name),
              cursor: ingoreTerms.indexOf(main_term_id) === -1 ? 'pointer' : 'default'
            }}
            className={`tags ${tagColor(main_term_name)}`} rel='tag'>
            {main_term_name}
          </span>
        </div>
        {
        sub_term_name && sub_term_name !== main_term_name &&
        <div className='mix-tag-topic' onClick={this.selectSubTerm}>
          <span
            style={{
              background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${sub_term_img || '/static/images/no-image.png'})`,
              backgroundSize: 'cover',
              fontSize: dynamicFontSize(sub_term_name),
              cursor: ingoreTerms.indexOf(sub_term_id) === -1 ? 'pointer' : 'default'
            }}
            className={`tags ${tagColor(sub_term_name)}`} rel='tag'>
            {sub_term_name}
          </span>
        </div>
        }
      </div>
    )
  }

  renderThumnails = (images) => {
    if (images.length > 0) {
      return (
        <div className='preview-child-topics' style={{ width: 'fit-content', position: 'absolute', bottom: '30px' }}>
          {_.map(images, item =>
            <a
              key={`thumbnail-${item.name}`}
              style={{ display: 'inline-block' }}
              data-tooltip={item.name}
              data-position='bottom'
              className='bottom'>
              <img
                style={{width: '40px', height: '40px'}}
                className='thumbnail'
                width='40'
                height='40'
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

  render () {
    /* eslint-disable camelcase */
    const { disc_url_id, site_tld, site_img, title, desc, search_num, img } = this.props
    const images = [{ name: site_tld, img: site_img }]
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
              <p className='discovery-description' >
                {desc}
              </p>
              <div className='caption' style={{ bottom: '72px', right: '-12px' }}>
                {this.renderTerms()}
              </div>
            </a>
            {this.renderThumnails(images)}
            <span style={{ fontSize: '11px' }}>S: {search_num} ID: {disc_url_id}</span>
          </div>
        </div>
      </div>
    )
  }
}
