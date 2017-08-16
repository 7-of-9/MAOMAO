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
  onChange = (isSelect, topicId, title, img) => {
  }

  onSelect = (topicId, topicName, img) => {
  }

  onBack = () => {
  }

  backButton = () => {
    return (
      <div className='navigation-panel' />
    )
  }

  cleanClassName = () => {
    logger.warn('TopicTree cleanClassName', this.animateEl)
    if (this.animateEl) {
      /* global $ */
      $(this.animateEl).removeClass('bounceInLeft animated bounceInRight')
    }
  }

  componentWillUpdate () {
    logger.warn('TopicTree componentWillUpdate')
    this.cleanClassName()
  }

  render () {
    const items = []
    const { discoveries } = toJS(this.props.term)
    const { animationType } = toJS(this.props.ui)
    _.forEach(discoveries, (item) => {
       /* eslint-disable camelcase */
      items.push(
        <DiscoveryItem
          key={`${item.disc_url_id}-${item.title}`}
          {...item}
          />
        )
    })
    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated` : `grid-row bounceInRight animated`
    return (
      <div className='topic-tree'>
        {this.backButton()}
        <div className='main-inner'>
          <div className='container-masonry'>
            <div ref={(el) => { this.animateEl = el }} className={animateClassName}>
              {items}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DiscoveryList
