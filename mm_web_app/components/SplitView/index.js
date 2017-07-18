/**
*
* UnlockNow
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Resizable from 'react-resizable-box'
import logger from '../../utils/logger'

class SplitView extends React.PureComponent {
  static propTypes = {
    onResizeStop: PropTypes.func.isRequired,
    width: PropTypes.any.isRequired
  }

  onResizeStop = () => {
    logger.warn('onResizeStop', this.resizable)
    const { width } = this.resizable.state
    this.props.onResizeStop(width)
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
        {this.props.children(this.props.width, window.outerHeight)}
      </Resizable>)
  }
}

export default SplitView
