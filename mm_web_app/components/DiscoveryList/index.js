/**
*
* DiscoveryList
*
*/

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
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

  onSelect = (item) => {
    this.props.ui.selectDiscoveryItem(item)
  }

  onChangePreviewItem = (item) => {
    this.props.ui.toggleSplitView(true)
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

  backButton = () => {
    const { discoveryUrlId, selectedDiscoveryItem: { main_term_id }, isSplitView } = toJS(this.props.ui)
    if (discoveryUrlId && discoveryUrlId !== -1) {
      const term = this.props.store.getCurrentTerm(main_term_id)
      if (term) {
        const { img, term_name: title } = term
        return (
          <div className={isSplitView ? 'navigation-panel bounceInLeft animated' : 'navigation-pane bounceInRight animated'} style={{'right': '0'}}>
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

  renderTermSuggestionList = (isSplitView, discoveryTermId, terms, urlId) => {
    logger.warn('renderTermSuggestionList', discoveryTermId, terms)
    const { currentWidth } = this.state
    if (terms.length) {
      const topics = terms.find(item => item.termId === discoveryTermId)
      if (topics && topics.discoveries && topics.discoveries.length) {
        const items = []
        _.forEach(topics.discoveries, (item) => {
          /* eslint-disable camelcase */
          if (urlId !== item.disc_url_id) {
            const term = this.props.store.getCurrentTerm(item.main_term_id)
            if (term) {
              const { img: main_term_img, term_name: main_term_name } = term
              items.push(
                <DiscoveryItem
                  key={`${item.disc_url_id}-${item.title}`}
                  main_term_img={main_term_img}
                  main_term_name={main_term_name}
                  onSelect={this.onChangePreviewItem}
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
    const { isSplitView, discoveryTermId, selectedDiscoveryItem: { disc_url_id: urlId, url, title, utc, main_term_id: termId, main_term_related_suggestions_term_ids: termIds } } = toJS(this.props.ui)
    const items = []
    termIds.forEach(id => {
      if (id !== termId) {
        const term = this.props.store.getCurrentTerm(id)
        if (term) {
          items.push(term)
        }
      }
    })
    const { currentWidth, isResize } = this.state
    const { terms } = toJS(this.props.term)
    if (isSplitView) {
      return (
        <div className='discovery-list'>
          { !isResize && this.renderTermSuggestionList(isSplitView, discoveryTermId, terms, urlId) }
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
        </div>
      )
    }
    if (discoveryTermId > 0) {
      return this.renderTermSuggestionList(isSplitView, discoveryTermId, terms, urlId)
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
    const { animationType, discoveryUrlId } = toJS(this.props.ui)
    logger.warn('DiscoveryList render ', this.props.term.hasMore)
    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated` : `grid-row bounceInRight animated`
    return (
      <div className='topic-tree'>
        {this.backButton()}
        <ReactResizeDetector handleWidth handleHeight onResize={this.onZoomLayout} />
        <div className='main-inner'>
          <div className='container-masonry'>
            <div ref={(el) => { this.animateEl = el }} className={animateClassName}>
              <InfiniteScroll
                pageStart={0}
                loadMore={this.loadMore}
                hasMore={this.props.term.hasMore}
                loader={<Loading isLoading />}
              >
                <div className='discover-root'>
                  {discoveryUrlId === -1 && this.renderList(discoveryUrlId)}
                </div>
              </InfiniteScroll>
              {discoveryUrlId !== -1 && this.renderDetail(discoveryUrlId)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DiscoveryList
