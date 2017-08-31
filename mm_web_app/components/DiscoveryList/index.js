/**
*
* DiscoveryList
*
*/

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import Sticky from 'react-sticky-el'
import ReactResizeDetector from 'react-resize-detector'
import InfiniteScroll from 'react-infinite-scroller'
import DiscoveryItem from './DiscoveryItem'
import DiscoveryDetail from './DiscoveryDetail'
import SplitView from '../SplitView'
import Loading from '../Loading'
import logger from '../../utils/logger'

@inject('term')
@inject('store')
@inject('ui')
@observer
class DiscoveryList extends Component {
  state = {
    innerWidth: window.innerWidth,
    currentWidth: window.innerWidth / 2,
    isResize: false
  }

  onSelectTerm = (termId) => {
    logger.warn('DiscoveryNavigation selectDiscoveryTerm', termId)
    this.props.ui.selectDiscoveryTerm(termId)
    const { userId, userHash } = this.props.store
    this.props.term.getTermDiscover(userId, userHash, termId)
  }

  onSelect = (item) => {
    this.props.ui.selectDiscoveryItem(item)
  }

  onBack = () => {
    this.props.ui.backToRootDiscovery()
  }

  onResizeStart = () => {
    this.setState({ isResize: true })
  }

  onResizeStop = (width) => {
    this.setState({ currentWidth: width, isResize: false })
  }

  onZoomLayout = () => {
    const { innerWidth } = this.state
    if (innerWidth !== window.innerWidth) {
      logger.warn('onZoomLayout')
      this.setState({
        currentWidth: window.innerWidth / 2,
        innerWidth: window.innerWidth
      })
    }
  }

  backButton = (isRootView) => {
    const { discoveryTermId, isSplitView, selectedDiscoveryItem: { main_term_id: mainTermId } } = toJS(this.props.ui)
    if (!isRootView) {
      const term = this.props.store.getCurrentTerm(discoveryTermId > 0 ? discoveryTermId : mainTermId)
      if (term) {
        const { img, term_name: title } = term
        return (
          <div className={isSplitView ? 'navigation-panel bounceInRight animated' : 'navigation-pane bounceInLeft animated'} style={{left: '50%'}}>
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

  closePreview = () => {
    this.props.ui.toggleSplitView(false)
  }

  renderTermList = (isSplitView, ingoreTerms, discoveryTermId, terms, urlId) => {
    logger.warn('renderTermList', isSplitView, discoveryTermId, terms)
    const { currentWidth } = this.state
    if (terms.length) {
      const topics = terms.find(item => item.termId === discoveryTermId)
      if (topics && topics.discoveries && topics.discoveries.length) {
        const items = []
        _.forEach(topics.discoveries, (item) => {
          /* eslint-disable camelcase */
          if (urlId !== item.disc_url_id) {
            const term = this.props.store.getCurrentTerm(item.main_term_id)
            const subTerm = this.props.store.getCurrentTerm(item.sub_term_id)
            if (term && subTerm) {
              const { img: main_term_img, term_name: main_term_name } = term
              const { img: sub_term_img, term_name: sub_term_name } = subTerm
              items.push(
                <DiscoveryItem
                  key={`${item.disc_url_id}-${item.url}`}
                  ingoreTerms={ingoreTerms}
                  main_term_img={main_term_img}
                  main_term_name={main_term_name}
                  sub_term_img={sub_term_img}
                  sub_term_name={sub_term_name}
                  onSelect={this.onSelect}
                  onSelectTerm={this.onSelectTerm}
                  {...item}
                 />
               )
            }
          }
        })
        return (<div className='split-view' style={{ width: isSplitView ? window.innerWidth - currentWidth - 50 : '100%' }}>
          {items}
        </div>)
      } else {
        return (<div className='split-view' style={{ width: isSplitView ? window.innerWidth - currentWidth - 50 : '100%' }}>
          <Loading isLoading />
        </div>)
      }
    }
  }

  renderDetail = () => {
    const { isSplitView, discoveryUrlId, discoveryTermId, selectedDiscoveryItem: { disc_url_id: urlId, url, title, utc, main_term_id: termId, main_term_related_suggestions_term_ids: termIds } } = toJS(this.props.ui)
    const ingoreTerms = []
    if (discoveryTermId !== -1) {
      ingoreTerms.push(discoveryTermId)
    }
    if (termId !== -1) {
      ingoreTerms.push(termId)
    }
    const items = []
    if (termIds) {
      termIds.forEach(id => {
        if (id !== termId) {
          const term = this.props.store.getCurrentTerm(id)
          if (term) {
            items.push(term)
          }
        }
      })
    }
    const { currentWidth, isResize } = this.state
    const { terms } = toJS(this.props.term)
    logger.warn('isSplitView', isSplitView)
    if (isSplitView && discoveryUrlId !== -1) {
      return (
        <div className='discovery-list'>
          { !isResize && this.renderTermList(isSplitView, ingoreTerms, discoveryTermId, terms, urlId) }
          <Sticky>
            { !isResize && <div className='close_button' onClick={this.closePreview} /> }
            {
             isSplitView && <SplitView onResizeStart={this.onResizeStart} onResizeStop={this.onResizeStop}>
               {(width, height) => (
                 <DiscoveryDetail
                   items={items}
                   title={title}
                   termIds={termIds}
                   url={url}
                   utc={utc}
                   width={currentWidth - 5}
                   closePreview={this.closePreview}
                  />
                  )
              }
             </SplitView>
            }
          </Sticky>
        </div>
      )
    }
    logger.warn('discoveryTermId', discoveryTermId)
    if (discoveryTermId > 0) {
      return this.renderTermList(isSplitView && discoveryUrlId !== -1, ingoreTerms, discoveryTermId, terms, urlId)
    }
    return (
      <DiscoveryDetail
        items={items}
        title={title}
        termIds={termIds}
        url={url}
        utc={utc}
        width={'100%'}
        closePreview={this.closePreview}
    />
    )
  }

  renderRootList = () => {
    const items = []
    const { discoveries } = toJS(this.props.term)
    _.forEach(discoveries, (item) => {
      /* eslint-disable camelcase */
      const term = this.props.store.getCurrentTerm(item.main_term_id)
      const subTerm = this.props.store.getCurrentTerm(item.sub_term_id)
      if (term && subTerm) {
        const { img: main_term_img, term_name: main_term_name } = term
        const { img: sub_term_img, term_name: sub_term_name } = subTerm
        items.push(
          <DiscoveryItem
            key={`${item.disc_url_id}-${item.url}`}
            main_term_img={main_term_img}
            main_term_name={main_term_name}
            sub_term_img={sub_term_img}
            sub_term_name={sub_term_name}
            onSelect={this.onSelect}
            onSelectTerm={this.onSelectTerm}
            {...item}
           />
         )
      }
    })
    return (<div className='discovery-list'> {items} </div>)
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
    const { animationType, discoveryUrlId, discoveryTermId } = toJS(this.props.ui)
    logger.warn('DiscoveryList render ', this.props.term.hasMore)
    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated` : `grid-row bounceInRight animated`
    const isRootView = discoveryUrlId === -1 && discoveryTermId === -1
    return (
      <div className='topic-tree'>
        {this.backButton(isRootView)}
        <ReactResizeDetector handleWidth handleHeight onResize={this.onZoomLayout} />
        <div className='main-inner'>
          <div className='container-masonry'>
            <div ref={(el) => { this.animateEl = el }} className={animateClassName}>
              {
                isRootView &&
                <InfiniteScroll
                  pageStart={0}
                  loadMore={this.loadMore}
                  hasMore={this.props.term.hasMore}
                  loader={<Loading isLoading />}
                >
                  <div className='discover-root'>
                    {this.renderRootList()}
                  </div>
                </InfiniteScroll>
              }
              { !isRootView && this.renderDetail()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DiscoveryList
