/**
*
* UnlockNow
*
*/

import React from 'react'
import Resizable from 'react-resizable-box'
import logger from '../../utils/logger'

class SplitView extends React.Component {
  state = {
    width: window.innerWidth / 2,
    height: window.outerHeight
  }

  onResizeStop = () => {
    logger.warn('onResizeStop', this.resizable)
    const { width, height } = this.resizable.state
    if (width !== this.state.width) {
      this.setState({
        width: width,
        height: height
      })
    }
  }

  render () {
    return (
      <Resizable
        enable={{ top: false, right: true, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
        className='resizable'
        ref={c => { this.resizable = c }}
        width={window.innerWidth / 2}
        onResizeStop={this.onResizeStop}
        >
        {this.props.children(this.state.width, this.state.height)}
      </Resizable>)
  }
}

export default SplitView
