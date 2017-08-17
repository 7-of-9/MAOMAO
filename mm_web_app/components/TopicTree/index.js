/**
*
* TopicTree
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import TopicItem from './TopicItem'
import Loading from '../Loading'
import logger from '../../utils/logger'

const parentTopicInfo = (tree, termId, treeLevel) => {
  if (treeLevel <= 2) {
    return { term_id: '', term_name: '', img: '' }
  } else {
    for (let counter = 0; counter < tree.length; counter += 1) {
      const foundTopicTree = _.find(tree[counter].child_topics, item => item.term_id === termId)
      if (foundTopicTree) {
        return tree[counter]
      }
    }
    for (let counter = 0; counter < tree.length; counter += 1) {
      const foundChild = parentTopicInfo(tree[counter].child_topics, termId, treeLevel)
      if (foundChild) {
        return foundChild
      }
    }
  }
}

const currentTopicTree = (tree, termId) => {
  if (termId === '') {
    return tree
  } else {
    const foundTree = _.find(tree, item => item.term_id === termId)
    if (foundTree) {
      return foundTree.child_topics
    } else {
      for (let counter = 0; counter < tree.length; counter += 1) {
        const topic = currentTopicTree(tree[counter].child_topics, termId)
        if (topic) {
          return topic
        }
      }
    }
  }
}

@inject('store')
@inject('ui')
@observer
class TopicTree extends PureComponent {
  onChange = (isSelect, termId, title, img) => {
    this.props.ui.toggleSelectTopic(isSelect, termId, title, img)
  }

  onSelect = (termId, termName, img) => {
    this.props.ui.selectTopicTree(termId, termName, img)
  }

  selectChildTopics = (topics) => {
    logger.warn('selectChildTopics', topics)
    // this.props.ui.selectChildTopics(topics)
  }

  onBack = () => {
    const { tree } = toJS(this.props.store)
    const { currentTermId, treeLevel } = toJS(this.props.ui)
    const parentTopic = parentTopicInfo(tree, currentTermId, treeLevel)
    this.props.ui.selectTopicTree(parentTopic.term_id, parentTopic.term_name, parentTopic.img, -1)
  }

  backButton = () => {
    const { currentTermId, currentTermTitle, currentTermImage: img } = toJS(this.props.ui)

    return (
      <div className='navigation-panel'>
        {
          currentTermId && currentTermId !== '' &&
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
              {currentTermTitle}
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

  componentWillUpdate () {
    logger.warn('TopicTree componentWillUpdate')
    this.cleanClassName()
  }

  render () {
    const items = []
    const { tree, isProcessingTopicTree } = toJS(this.props.store)
    if (isProcessingTopicTree) {
      return (<Loading isLoading />)
    }
    const { currentTermId, treeLevel, animationType, selectedTopics } = toJS(this.props.ui)
    logger.warn('TopicTree render', currentTermId, treeLevel)

    _.forEach(currentTopicTree(tree, currentTermId), (item) => {
       /* eslint-disable camelcase */
      const { term_id, term_name: title, img, child_topics } = item
      const isSelect = this.props.ui.selectedTopics.find(item => item.termId === term_id)
      items.push(
        <TopicItem
          key={term_id}
          term_id={term_id}
          isSelect={!!isSelect}
          title={title}
          onChange={this.onChange}
          onSelect={this.onSelect}
          selectChildTopics={this.selectChildTopics}
          selectedTopics={selectedTopics}
          hasChild={child_topics.length > 0}
          totals={child_topics.length}
          childTopics={child_topics}
          img={img}
          />
        )
    })
    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated level-${treeLevel}` : `grid-row bounceInRight animated level-${treeLevel}`
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

export default TopicTree
