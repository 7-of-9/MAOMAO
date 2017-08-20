/**
*
* GridView
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import ReactResizeDetector from 'react-resize-detector'
import Masonry from 'react-masonry-component'
import { Subscribe } from 'react-subscribe'
import eventEmitter from '../../utils/eventEmitter'
import logger from '../../utils/logger'

const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s',
  columnWidth: '.grid-sizer',
  percentPosition: true
}

@inject('store')
@inject('ui')
@observer
class GridView extends React.PureComponent {
  onLayout = () => {
    logger.warn('onLayout', this.masonry)
    this.masonry.layout()
  }

  componentDidUpdate () {
    this.onLayout()
  }

  componentDidMount () {
    this.onLayout()
  }

  render () {
    return (
      <div className='main-inner'>
        <Subscribe target={eventEmitter} eventName='layout' listener={this.onLayout} />
        <ReactResizeDetector handleWidth handleHeight onResize={this.onLayout} />
        <Masonry
          className='container-masonry'
          options={masonryOptions}
          ref={(c) => { this.masonry = this.masonry || c.masonry }}
          >
          <div className='grid-row'>
            <div className='grid-sizer' />
            {this.props.children}
          </div>
        </Masonry>
      </div>
    )
  }
}

export default GridView
