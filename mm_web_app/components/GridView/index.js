/**
*
* GridView
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import Masonry from 'react-masonry-component'

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
    this.masonry && this.masonry.layout()
  }

  render () {
    return (
      <div className='main-inner'>
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
