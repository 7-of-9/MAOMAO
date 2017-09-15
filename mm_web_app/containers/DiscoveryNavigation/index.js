/**
*
* DiscoveryNavigation
*
*/

import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import OwlCarousel from 'react-owl-carousel'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'

@inject('store')
@inject('term')
@inject('ui')
@observer
class DiscoveryNavigation extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    termIds: PropTypes.array.isRequired,
    isReady: PropTypes.bool.isRequired,
    onSelectTerm: PropTypes.func.isRequired
  }

  static defaultProps = {
    items: [],
    termIds: [],
    isReady: false,
    onSelectTerm: (term) => {}
  }

  selectTerm = (term) => {
    logger.info('DiscoveryNavigation selectDiscoveryTerm', term)
    this.props.onSelectTerm(term)
    this.props.ui.toggleSplitView(true)
  }

  componentWillReact () {
    logger.info('DiscoveryNavigation componentWillReact')
  }

  renderNavigationItems (selectedItems) {
    logger.info('selectedItems', selectedItems)
    const validTerms = _.filter(selectedItems, item => item.term_name !== '...')
    if (validTerms && validTerms.length) {
      return _.map(validTerms, (term) => (<div className='selected-topic' key={`topic-${term.term_id}`} style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(${term.img || '/static/images/no-image.png'}) `,
        backgroundSize: 'cover',
        cursor: 'pointer'
      }} onClick={() => this.selectTerm(term)}>
        <p className='blur-bg'>
          <span className='text-topic'>{term.term_name}</span>
        </p>
      </div>))
    } else {
      return (<Loading isLoading />)
    }
  }

  componentDidMount () {
    const { items } = this.props
    logger.info('DiscoveryNavigation componentDidMount selectedItems', items)
    _.forEach(items, ({ term_id }) => this.props.term.loadNewTerm(term_id))
  }

  render () {
    const { items, isReady } = this.props
    logger.info('DiscoveryNavigation render', isReady, items, this.props)
    const settings = {
      navContainerClass: 'carousel-nav owl-nav',
      stageOuterClass: 'carousel-outer owl-stage-outer',
      stageClass: 'carousel-stage owl-stage',
      nav: true,
      autoWidth: true,
      navText: [
        '<',
        '>'
      ]
    }
    return (
      <div className='carousel-wrapper'>
        <OwlCarousel
          className='owl-theme'
          ref={(el) => { this.slider = el }}
          {...settings}
            >
          {
              this.renderNavigationItems(items)
          }
        </OwlCarousel>
      </div>
    )
  }
}

export default DiscoveryNavigation
