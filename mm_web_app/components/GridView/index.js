/**
*
* GridView
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Masonry from 'react-masonry-component'
import GridItem from '../../components/GridItem'
import logger from '../../utils/logger'

const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s'
}

class GridView extends React.PureComponent {
  render () {
    const { urls, maxScore, topics } = this.props
    logger.warn('topics', topics)
    const selectedTopics = topics.map(item => ({name: item.term_name, urlIds: item.url_ids}))
    const items = []
    if (urls && urls.length) {
      _.forEach(urls, (item) => {
        items.push(<GridItem key={item.id} topics={selectedTopics} url={item} maxScore={maxScore} />)
      })
    }
    return (
      <div className='main-inner'>
        <Masonry className='container-masonry' options={masonryOptions}>
          <div className='grid-row'>
            {items}
          </div>
        </Masonry>
      </div>
    )
  }
 }

GridView.propTypes = {
  urls: PropTypes.array.isRequired,
  topics: PropTypes.array.isRequired,
  maxScore: PropTypes.number.isRequired
}

export default GridView
