/**
*
* DiscoveryList
*
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import Sticky from 'react-sticky-el'
import ReactResizeDetector from 'react-resize-detector'
import InfiniteScroll from 'react-infinite-scroller'
import DiscoveryItem from './DiscoveryItem'
import DiscoveryDetail from './DiscoveryDetail'
import SplitView from '../../components/SplitView'
import Loading from '../../components/Loading'
import { isSameStringOnUrl } from '../../utils/helper'
import logger from '../../utils/logger'

const MARGIN_FOR_SLITTER = 50

@inject('term')
@inject('store')
@inject('ui')
@observer
class DiscoveryList extends Component {
  static propTypes = {
    profileUrl: PropTypes.string.isRequired
  }

  static defaultProps = {
    profileUrl: ''
  }
  state = {
    isResize: false
  }

  onSelect = (item) => {
    logger.warn('onSelect', item)
    this.props.ui.selectDiscoveryItem(item)
    if (this.props.ui.discoveryTermId > 0) {
      this.props.ui.toggleSplitView(true)
    }
  }

  onSelectChildTerm = (term) => {
    logger.warn('onSelectChildTerm term', term)
    this.props.ui.selectDiscoveryTerm(term.term_id)
    const { findTerms } = toJS(this.props.term)
    findTerms.push(_.toLower(term.term_name))
    logger.info('findTerms', findTerms)
    this.props.term.getTermDiscover(term.term_id)
    this.props.term.setCurrentTerms(findTerms)
    this.props.term.addNewTerm(term)
    this.props.term.loadNewTerm(term.term_id)
    const href = `/${findTerms.join('/')}`
    Router.push(
      {
        pathname: '/',
        query: { findTerms }
      },
      href,
     { shallow: true }
    )
  }

  onBack = (term) => {
    logger.info('onBack term', term)
    const position = _.findIndex(this.props.term.findTerms, item => isSameStringOnUrl(item, term.term_name))
    const terms = _.dropRight(this.props.term.findTerms, this.props.term.findTerms.length - position)
    this.props.term.setCurrentTerms(terms)
    if (terms.length) {
      const href = `/${terms.join('/')}`
      Router.push(
        {
          pathname: '/',
          query: { findTerms: terms }
        },
        href,
       { shallow: true }
      )
      const currentTerm = _.find(this.props.term.termsInfo.terms, item => isSameStringOnUrl(item.term_name, terms[terms.length - 1]))
      if (currentTerm && currentTerm.term_id) {
        this.props.ui.selectDiscoveryTerm(currentTerm.term_id)
        this.props.term.getTermDiscover(currentTerm.term_id)
      }
    } else {
      if (this.props.store.userId > 0) {
        this.props.ui.backToRootDiscovery()
        const { user } = this.props.store
        if (user) {
          Router.push({ pathname: '/', query: { profileUrl: `/${user.nav_id}` } }, `/${user.nav_id}`, { shallow: true })
        }
      } else {
        Router.push('/', '/', { shallow: true })
      }
    }
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
      logger.info('onZoomLayout')
      this.setState({
        currentWidth: window.innerWidth / 2,
        innerWidth: window.innerWidth
      })
    }
  }

  getCurrentTerm = (termId) => {
    if (this.props.term.termsCache[termId]) {
      return toJS(this.props.term.termsCache[termId])
    } else {
      return { term_id: termId, term_name: '...', img: '/static/images/no-image.png', child_suggestions: [], child_topics: [] }
    }
  }

  backButton = (isRootView) => {
    const { isSplitView, discoveryTermId } = toJS(this.props.ui)
    const { currentWidth } = this.state
    logger.info('discoveryTermId', discoveryTermId)
    const topics = []
    if (discoveryTermId > 0) {
      const currentTerm = this.getCurrentTerm(discoveryTermId)
      const { child_suggestions: childSuggestions, child_topics: childTopics } = currentTerm
      logger.info('currentTerm, childSuggestions, childTopics', currentTerm, childSuggestions, childTopics)
      if (childSuggestions) {
        _.forEach(childSuggestions, term => {
          if (term.term_name !== '...') {
            topics.push(term)
          }
        })
      }
      if (childTopics) {
        _.forEach(childTopics, term => {
          if (term.term_name !== '...') {
            topics.push(term)
          }
        })
      }
    }

    if (!isRootView) {
      const { findTerms, termsInfo: { terms } } = this.props.term
      const items = []
      _.forEach(findTerms, item => {
        const term = _.find(terms, term => isSameStringOnUrl(term.term_name, item))
        if (term) {
          const { img, term_name: title } = term
          items.push(<span
            key={`back-to-${title}`}
            onClick={() => this.onBack(term)}
            style={{
              background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
              backgroundSize: 'cover',
              cursor: 'pointer'
            }}
            className='current-topic-name tags' rel='tag'>
            <i className='fa fa-angle-left' aria-hidden='true' /> &nbsp;&nbsp;
            {title}
          </span>)
        }
      })
      if (topics.length) {
        const carouselItems = []
        _.forEach(topics, term => {
          const { img, term_name: title } = term
          if (!_.find(findTerms, term => isSameStringOnUrl(term, title))) {
            carouselItems.push(<span
              key={`navigate-to-${title}`}
              onClick={() => this.onSelectChildTerm(term)}
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.8)), url(${img || '/static/images/no-image.png'})`,
                backgroundSize: 'cover',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '3px'
              }}
              className='current-topic-name tags' rel='tag'>
              {title}
            </span>)
          }
        })
        items.push(carouselItems)
      }
      if (items.length) {
        return (
          <div className={isSplitView ? 'navigation-panel bounceInRight animated' : 'navigation-pane bounceInLeft animated'} style={{ left: currentWidth + MARGIN_FOR_SLITTER / 2 }}>
            <div className='breadcrum'>
              {items}
            </div>
          </div>
        )
      }
    }
    return null
  }

  cleanClassName = () => {
    logger.info('DiscoveryList cleanClassName', this.animateEl)
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
    logger.warn('renderTermList')
    const { currentWidth } = this.state
    if (this.props.term.isLoading || this.props.store.isLoading) {
      return (<div className='split-view' style={{ width: isSplitView ? window.innerWidth - currentWidth - MARGIN_FOR_SLITTER : '100%' }}>
        <Loading isLoading />
      </div>)
    }
    if (terms.length) {
      const topics = _.find(terms, item => item.termId === discoveryTermId)
      if (topics && topics.discoveries && topics.discoveries.length) {
        const items = []
        _.forEach(topics.discoveries, (item) => {
          /* eslint-disable camelcase */
          if (urlId !== item.disc_url_id) {
            const term = this.getCurrentTerm(item.main_term_id)
            const subTerm = this.getCurrentTerm(item.sub_term_id)
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
                  onSelectTerm={this.onSelectChildTerm}
                  {...item}
                 />
               )
            }
          }
        })
        return (<div className='split-view' style={{ width: isSplitView ? window.innerWidth - currentWidth - MARGIN_FOR_SLITTER : '100%' }}>
          {items}
        </div>)
      } else {
        return (<div className='split-view' style={{ width: isSplitView ? window.innerWidth - currentWidth - MARGIN_FOR_SLITTER : '100%' }}>
          <p className='text-engine animated fadeInUp'>Coming soon...</p>
        </div>)
      }
    }
  }

  renderDetail = () => {
    logger.warn('renderDetail')
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
      _.forEach(termIds, id => {
        if (id !== termId) {
          const term = this.getCurrentTerm(id)
          if (term) {
            items.push(term)
          }
        }
      })
    }
    const { currentWidth, isResize } = this.state
    const { terms } = toJS(this.props.term)
    logger.info('isSplitView', isSplitView)
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
                   onSelectTerm={this.onSelectChildTerm}
                  />
                  )
              }
             </SplitView>
            }
          </Sticky>
        </div>
      )
    }
    logger.info('discoveryTermId', discoveryTermId)
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
        onSelectTerm={this.onSelectChildTerm}
    />
    )
  }

  renderRootList = () => {
    logger.warn('renderRootList')
    const items = []
    const { discoveries } = toJS(this.props.term)
    _.forEach(discoveries, (item) => {
      /* eslint-disable camelcase */
      const term = this.getCurrentTerm(item.main_term_id)
      const subTerm = this.getCurrentTerm(item.sub_term_id)
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
            onSelectTerm={this.onSelectChildTerm}
            {...item}
           />
         )
      }
    })
    return (<div className='discovery-list'> {items} </div>)
  }

  componentWillUpdate () {
    logger.info('DiscoveryList componentWillUpdate')
    this.cleanClassName()
  }

  componentWillReact () {
    const { userId, userHash } = this.props.store
    const { page } = this.props.term
    logger.info('DiscoveryList componentWillReact', userId, userHash, page)
  }

  componentDidMount () {
    const { userId, userHash } = this.props.store
    const { page } = this.props.term
    if (userId > 0) {
      this.props.term.getRootDiscover(userId, userHash, page)
    }
    logger.warn('DiscoveryList componentDidMount', userId, userHash, page)
    this.setState({
      innerWidth: window.innerWidth,
      currentWidth: window.innerWidth / 2
    })
  }

  render () {
    const { profileUrl } = this.props
    const { animationType, discoveryUrlId, discoveryTermId } = toJS(this.props.ui)
    logger.info('DiscoveryList render ', this.props.term.hasMore)
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
                isRootView && profileUrl.length > 0 &&
                <InfiniteScroll
                  pageStart={0}
                  loadMore={this.loadMore}
                  hasMore={this.props.term.hasMore}
                  loader={<Loading isLoading />}
                >
                  <div className='discover-root'>
                    { this.renderRootList() }
                  </div>
                </InfiniteScroll>
              }
              {
                isRootView && profileUrl.length > 0 &&
                <Loading isLoading={this.props.term.isLoading} />
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
