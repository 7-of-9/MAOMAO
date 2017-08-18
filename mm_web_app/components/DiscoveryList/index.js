/**
*
* DiscoveryList
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import InfiniteScroll from 'react-infinite-scroller'
import DiscoveryItem from './DiscoveryItem'
import DiscoveryDetail from './DiscoveryDetail'
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
    const { discoveryUrlId, selectedDiscoveryItem: { main_term_id } } = toJS(this.props.ui)
    if (discoveryUrlId && discoveryUrlId !== -1) {
      const { img, term_name: title } = this.props.store.getCurrentTerm(main_term_id)
      return (
        <div className='navigation-panel'>
          <div className='breadcrum'>
            <span
              onClick={this.onBack}
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
                backgroundSize: 'cover',
                cursor: 'pointer'
              }}
              className='current-topic-name tags' rel='tag'>
              <i className='fa fa-angle-left' aria-hidden='true' /> &nbsp;&nbsp;
              {title}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  cleanClassName = () => {
    logger.warn('DiscoveryList cleanClassName', this.animateEl)
    /* global $ */
    if (this.animateEl && typeof $ !== 'undefined') {
      $(this.animateEl).removeClass('bounceInLeft animated bounceInRight')
    }
  }

  loadMore = () => {
    logger.warn('DiscoveryList loadMore')
    this.props.term.loadMore()
  }

  renderDetail = (selectedDiscoveryItem) => {
    const { selectedDiscoveryItem: { url, title, utc, main_term_id: termId, main_term_related_suggestions_term_ids: termIds } } = toJS(this.props.ui)
    const items = []
    termIds.forEach(id => {
      if (id !== termId) {
        const term = this.props.store.getCurrentTerm(id)
        if (term) {
          items.push(term)
        }
      }
    })
    return (
      <DiscoveryDetail
        items={items}
        title={title}
        url={url}
        utc={utc}
      />
    )
  }

  renderList = () => {
    const items = []
    const { discoveries } = toJS(this.props.term)
    _.forEach(discoveries, (item) => {
      /* eslint-disable camelcase */
      const term = this.props.store.getCurrentTerm(item.main_term_id)
      if (term) {
        const { img: main_term_img, term_name: main_term_name } = term
        items.push(
          <DiscoveryItem
            key={`${item.disc_url_id}-${item.title}`}
            main_term_img={main_term_img}
            main_term_name={main_term_name}
            onSelect={this.onSelect}
            {...item}
           />
         )
      }
    })
    return items
  }

  componentWillUpdate () {
    logger.warn('DiscoveryList componentWillUpdate')
    this.cleanClassName()
  }

  componentWillReact () {
    const { userId, userHash } = this.props.store
    logger.warn('DiscoveryList componentWillReact', userId, userHash)
  }

  componentDidMount () {
    const { userId, userHash } = this.props.store
    const { page } = this.props.term
    logger.warn('DiscoveryList componentDidMount', userId, userHash)
    this.props.term.getRootDiscover(userId, userHash, page)
  }

  render () {
    const { animationType, discoveryUrlId } = toJS(this.props.ui)
    logger.warn('DiscoveryList render ', this.props.term.hasMore)
    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated` : `grid-row bounceInRight animated`
    return (
      <div className='topic-tree'>
        {this.backButton()}
        <div className='main-inner'>
          <div className='container-masonry'>
            <div ref={(el) => { this.animateEl = el }} className={animateClassName}>
              {
                discoveryUrlId === -1 &&
                <InfiniteScroll
                  pageStart={0}
                  loadMore={this.loadMore}
                  hasMore={this.props.term.hasMore}
                >
                  {this.renderList()}
                </InfiniteScroll>
              }
              {discoveryUrlId !== -1 && this.renderDetail()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DiscoveryList
