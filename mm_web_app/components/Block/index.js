/**
*
* Block
*
*/

import React from 'react'
import * as logger from 'loglevel'
const TIME_TO_RELOAD = 1000 // 1s
/* global Masonry */
class Block extends React.Component {
  constructor () {
    super()
    if (typeof window === 'undefined') {
      this.isClient = false
    } else {
      this.isClient = true
    }
    logger.warn('Block', this.isClient)
  }

  componentDidMount () {
    if (this.isClient) {
      this.layer = new Masonry(this.container, {
        fitWidth: true,
        columnWidth: 240,
        gutter: 10,
        itemSelector: '.grid-item'
      })
      // Fix position layer
      this.timer = setInterval(() => {
        if (this.container) {
          this.layer = new Masonry(this.container, {
            fitWidth: true,
            columnWidth: 240,
            gutter: 10,
            itemSelector: '.grid-item'
          })
        }
      }, TIME_TO_RELOAD)
    }
  }

  componentDidUpdate () {
    // Fix position when loading image
    if (this.isClient) {
      this.layer = new Masonry(this.container, {
        fitWidth: true,
        columnWidth: 240,
        gutter: 10,
        itemSelector: '.grid-item'
      })
    }
  }

  componentWillUnmount () {
    if (this.isClient) {
      clearInterval(this.timer)
    }
  }

  render () {
    return (
      <div className='grid' ref={(element) => { this.container = element }} >
        {React.Children.toArray(this.props.children)}
      </div>
    )
  }
 }

export default Block
