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
    isReady: PropTypes.bool.isRequired
  }

  static defaultProps = {
    items: [],
    termIds: [],
    isReady: false
  }

  state = {
    isDone: false,
    currentItems: []
  }

  selectTerm = (termId) => {
    logger.info('DiscoveryNavigation selectDiscoveryTerm', termId)
    this.props.ui.selectDiscoveryTerm(termId)
    this.props.ui.toggleSplitView(true)
    const { userId, userHash } = this.props.store
    this.props.term.getTermDiscover(userId, userHash, termId)
  }

  componentWillReact () {
    logger.info('DiscoveryNavigation componentWillReact')
  }

  componentDidMount () {
    logger.info('DiscoveryNavigation componentDidMount')
    const { isReady, termIds } = this.props
    if (!isReady) {
      setTimeout(() => {
        const existTerms = []
        _.forEach(termIds, id => {
          const term = this.props.store.getCurrentTerm(id)
          if (term) {
            existTerms.push(term)
          }
        })
        if (existTerms.length === termIds.length) {
          this.setState({
            currentItems: _.map(existTerms, item => ({ img: item.img, name: item.term_name, id: item.term_id })),
            isDone: true
          })
        }
      }, 1000)
    } else {
      this.setState({ isDone: true })
    }
  }

  render () {
    const { items, isReady } = this.props
    const { isDone, currentItems } = this.state
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
    const selectedItems = currentItems.length ? currentItems : items
    return (
      <div className='carousel-wrapper'>
        <OwlCarousel
          className='owl-theme'
          ref={(el) => { this.slider = el }}
          {...settings}
            >
          {
            _.map(selectedItems, ({name, img, id}) => (
              <div
                className='selected-topic' key={`topic-${id}`}
                style={{
                  background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
                  backgroundSize: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => this.selectTerm(id)}
              >
                <p className='blur-bg'>
                  <span className='text-topic'>{name}</span>
                </p>
              </div>
          ))
          }
        </OwlCarousel>
        <Loading isLoading={!isDone} />
      </div>
    )
  }
}

export default DiscoveryNavigation
