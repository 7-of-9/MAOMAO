/**
*
* TopicTree
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import DiscoveryItem from './DiscoveryItem'
import logger from '../../utils/logger'

@inject('term')
@inject('store')
@inject('ui')
@observer
class DiscoveryList extends PureComponent {
  onSelect = (item) => {
    this.props.ui.selectDiscoveryItem(item)
  }

  onBack = () => {
    this.props.ui.backToRootDiscovery()
  }

  backButton = () => {
    const { discoveryUrlId, selectedDiscoveryItem: { main_term_img: img, main_term_name: title } } = toJS(this.props.ui)

    return (
      <div className='navigation-panel'>
        {
          discoveryUrlId && discoveryUrlId !== -1 &&
          <div className='breadcrum'>
            <button className='btn back-to-parent' onClick={this.onBack}>
              <i className='fa fa-angle-left' aria-hidden='true' />
            </button>
            <span
              onClick={this.onBack}
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
                backgroundSize: 'cover'
              }}
              className='current-topic-name tags' rel='tag'>
              {title}
            </span>
          </div>
        }
      </div>
    )
  }

  cleanClassName = () => {
    logger.warn('TopicTree cleanClassName', this.animateEl)
    if (this.animateEl) {
      /* global $ */
      $(this.animateEl).removeClass('bounceInLeft animated bounceInRight')
    }
  }

  renderDetail = (selectedDiscoveryItem) => {
    const { selectedDiscoveryItem: { url, title, desc, utc } } = toJS(this.props.ui)
    const PROXY_URL = '/api/preview'
    const proxyUrl = `${PROXY_URL}?url=${url}`
    return (
      <div
        style={{backgroundColor: '#fff', width: '100%', height: '100vh'}}
        >
        <h1>{title}</h1>
        <p>{desc}</p>
        <span>{utc}</span>
        <iframe
          className='iframe-view'
          sandbox='allow-same-origin'
          id={`frame-${url}`}
          name={`frame-${url}`}
          width='100%'
          height='100%'
          frameBorder='0'
          allowFullScreen
          allowTransparency
          src={proxyUrl}
        />
      </div>
    )
  }

  renderList = () => {
    const items = []
    const { discoveries } = toJS(this.props.term)
    _.forEach(discoveries, (item) => {
      /* eslint-disable camelcase */
      items.push(
        <DiscoveryItem
          key={`${item.disc_url_id}-${item.title}`}
          onSelect={this.onSelect}
          {...item}
         />
       )
    })
    return items
  }

  componentWillUpdate () {
    logger.warn('TopicTree componentWillUpdate')
    this.cleanClassName()
  }

  render () {
    const { animationType, discoveryUrlId } = toJS(this.props.ui)

    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated` : `grid-row bounceInRight animated`
    return (
      <div className='topic-tree'>
        {this.backButton()}
        <div className='main-inner'>
          <div className='container-masonry'>
            <div ref={(el) => { this.animateEl = el }} className={animateClassName}>
              {discoveryUrlId === -1 && this.renderList()}
              {discoveryUrlId !== -1 && this.renderDetail()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DiscoveryList
