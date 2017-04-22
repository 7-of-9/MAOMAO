/**
*
* StreamList
*
*/

import React from 'react'
import _ from 'lodash'
import * as logger from 'loglevel'
import StreamItem from '../../components/StreamItem'
import Loading from '../../components/Loading'
// const TIME_TO_RELOAD = 5000 // 5s
/* global Bricklayer */
class StreamList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isUpdating: false
    }
  }

  componentDidMount () {
    if (!this.state.isUpdating) {
      this.bricklayer = new Bricklayer(this.container)
    }
  }

  componentDidUpdate () {
    if (!this.state.isUpdating) {
      this.bricklayer.destroy()
      this.bricklayer = new Bricklayer(this.container)
    }
  }

  componentWillReceiveProps () {
    this.setState({
      isUpdating: true
    })

    setTimeout(() => {
      this.setState({
        isUpdating: false
      })
    }, _.max(this.props.urls.length * 10, 200))
  }

  componentWillUnmount () {
    logger.info('componentWillUnmount StreamList')
  }

  render () {
    const { isUpdating } = this.state
    if (isUpdating) {
      return <Loading isLoading />
    }
    const { urls } = this.props
    const items = []
    if (urls && urls.length) {
      const maxScore = _.maxBy(urls, 'im_score')
      const sortedUrlsByHitUTC = _.reverse(_.sortBy(urls, [(url) => url.hit_utc]))
      items.push(<div key={Date.now() + 1} style={{ clear: 'both' }} />)
      _.forEach(sortedUrlsByHitUTC, (item) => {
        items.push(<StreamItem key={item.id} url={item} maxScore={maxScore.im_score} />)
      })
    }
    return (
      <div className='bricklayer' ref={(el) => { this.container = el }}>
        {items}
      </div>
    )
  }
 }

StreamList.propTypes = {
  urls: React.PropTypes.array
}

export default StreamList
