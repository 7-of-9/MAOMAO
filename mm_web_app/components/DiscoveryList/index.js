/**
*
* TopicTree
*
*/

import React, { PureComponent } from 'react'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import Sticky from 'react-sticky-el'
import DiscoveryItem from './DiscoveryItem'
import InlinePreview from '../Streams/InlinePreview'
import logger from '../../utils/logger'

const DiscoveryNavigation = dynamic(
  import('./DiscoveryNavigation'),
  {
    ssr: false
  }
 )

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
    const { discoveryUrlId, selectedDiscoveryItem: { main_term_id } } = toJS(this.props.ui)
    if (discoveryUrlId && discoveryUrlId !== -1) {
      const { entities: { terms } } = toJS(this.props.store.normalizedTerm)
      const { img, term_name: title } = terms[main_term_id]
      return (
        <div className='navigation-panel'>
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
        </div>
      )
    }
    return null
  }

  cleanClassName = () => {
    logger.warn('TopicTree cleanClassName', this.animateEl)
    if (this.animateEl) {
      /* global $ */
      $(this.animateEl).removeClass('bounceInLeft animated bounceInRight')
    }
  }

  renderDetail = (selectedDiscoveryItem) => {
    const { selectedDiscoveryItem: { url, title, utc } } = toJS(this.props.ui)
    return (
      <div>
        <Sticky>
          <div className='selected-panel'>
            <DiscoveryNavigation />
          </div>
        </Sticky>
        <h1>{title}</h1>
        <span>{utc}</span>
        <InlinePreview
          width={'100%'}
          height={'100vh'}
          url={url}
          allowScript
        />
      </div>
    )
  }

  renderList = () => {
    const items = []
    const { discoveries } = toJS(this.props.term)
    const { entities: { terms } } = toJS(this.props.store.normalizedTerm)
    _.forEach(discoveries, (item) => {
      /* eslint-disable camelcase */
      const { img: main_term_img, term_name: main_term_name } = terms[item.main_term_id]
      items.push(
        <DiscoveryItem
          key={`${item.disc_url_id}-${item.title}`}
          main_term_img={main_term_img}
          main_term_name={main_term_name}
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
