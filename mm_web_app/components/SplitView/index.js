/**
*
* UnlockNow
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Resizable from 'react-resizable-box'
import logger from '../../utils/logger'

class SplitView extends React.Component {
  state = {
    ready: true
  }

  static propTypes = {
    onResizeStop: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired
  }

  static defaultProps = {
    onResizeStop: () => {},
    onResizeStart: () => {}
  }

  onResizeStart = () => {
    logger.info('onResizeStart', this.resizable)
    this.props.onResizeStart()
    this.setState({ ready: false })
  }

  onResizeStop = () => {
    logger.info('onResizeStop', this.resizable)
    const { width } = this.resizable.state
    this.props.onResizeStop(width)
    this.setState({ ready: true })
  }

  render () {
    const { ready } = this.state
    return (
      <Resizable
        enable={{ top: false, right: true, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
        className='resizable'
        ref={c => { this.resizable = c }}
        width={window.innerWidth / 2}
        onResizeStop={this.onResizeStop}
        onResizeStart={this.onResizeStart}
        >
        <div className={!ready ? 'hidden-view' : 'splitter-view'}>
          {this.props.children(this.resizable && this.resizable.state.width, window.outerHeight)}
        </div>
        {!ready && <div className='on-resize' />}
      </Resizable>)
  }
}

export default SplitView
