/**
*
* DiscoveryList
*
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import OwlCarousel from 'react-owl-carousel'
import Loading from '../../components/Loading'
import { isSameStringOnUrl } from '../../utils/helper'
import logger from '../../utils/logger'

const MARGIN_FOR_SLITTER = 50

@inject('term')
@inject('store')
@inject('ui')
@observer
class DiscoveryPath extends Component {
  static propTypes = {
    currentWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onBack: PropTypes.func.isRequired,
    onSelectChildTerm: PropTypes.func.isRequired
  }
  static defaultProps = {
    currentWidth: 0,
    onBack: () => {},
    onSelectChildTerm: () => {}
  }

  renderDiscoveryPath = (isRootView) => {
    const { isSplitView, discoveryTermId } = toJS(this.props.ui)
    logger.info('discoveryTermId', discoveryTermId)
    const currentTerm = this.props.term.termsCache[discoveryTermId]
    const { findTerms, termsInfo: { terms } } = this.props.term
    const { currentWidth } = this.props
    const items = []
    const topics = []
    const carouselItems = []
    _.forEach(findTerms, item => {
      const term = _.find(terms, term => isSameStringOnUrl(term.term_name, item))
      if (term) {
        const { img, term_name: title } = term
        items.push(<span
          key={`back-to-${title}`}
          onClick={() => this.props.onBack(term)}
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

    if (this.props.term.isLoading || !currentTerm) {
      return (
        <div className={isSplitView ? 'navigation-panel bounceInRight animated' : 'navigation-pane bounceInLeft animated'} style={{ left: currentWidth ? currentWidth + MARGIN_FOR_SLITTER / 2 : 0 }}>
          <div className='breadcrum'>
            {items}
            <Loading isLoading />
          </div>
        </div>
      )
    }

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

    if (topics.length) {
      _.forEach(_.uniqBy(topics, 'term_id'), term => {
        const { img, term_name: title, term_id: termId } = term
        if (!_.find(findTerms, term => isSameStringOnUrl(term, title))) {
          carouselItems.push(<span
            key={`navigate-to-${title}-${termId}`}
            onClick={() => this.props.onSelectChildTerm(term)}
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
    }
    if (carouselItems.length > 0) {
      const settings = {
        navContainerClass: 'carousel-nav owl-nav',
        stageOuterClass: 'carousel-outer owl-stage-outer',
        stageClass: 'carousel-stage owl-stage',
        nav: false,
        dots: false,
        autoWidth: true
      }
      return (
        <div className={isSplitView ? 'navigation-panel bounceInRight animated' : 'navigation-pane bounceInLeft animated'} style={{ left: currentWidth ? currentWidth + MARGIN_FOR_SLITTER / 2 : 0 }}>
          <div className='breadcrum'>
            {items}
            {carouselItems.length > 0 &&
              <OwlCarousel
                className='owl-theme'
                {...settings}
                  >
                {carouselItems}
              </OwlCarousel>
              }
          </div>
        </div>
      )
    } else {
      return (
        <div className={isSplitView ? 'navigation-panel bounceInRight animated' : 'navigation-pane bounceInLeft animated'} style={{ left: currentWidth ? currentWidth + MARGIN_FOR_SLITTER / 2 : 0 }}>
          <div className='breadcrum'>
            {items}
          </div>
        </div>
      )
    }
  }

  componentWillReact () {
    logger.warn('DiscoveryPath componentWillReact', this)
  }

  render () {
    return this.renderDiscoveryPath()
  }
}

export default DiscoveryPath
