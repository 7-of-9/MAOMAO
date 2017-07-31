import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Flight from 'react-flight/dom'
import logger from '../../utils/logger'

class AnimateBox extends PureComponent {
  static propTypes = {
    start: PropTypes.any.isRequired,
    finish: PropTypes.any.isRequired,
    duration: PropTypes.number
  }

  static defaultProps = {
    start: '<div> Start </div>',
    finish: '<div> Finish </div>',
    duration: 300
  }

  render () {
    logger.warn('AnimateBox render')
    return (
      <Flight interactive ref={flight => (this.flight = flight)}>
        <Flight.Frame duration={this.props.duration} source interactive>
          <div className='keyframe'>
            {this.props.start}
          </div>
        </Flight.Frame>
        <Flight.Frame duration={this.props.duration}>
          <div className='keyframe'>
            {this.props.end}
          </div>
        </Flight.Frame>
      </Flight>
    )
  }
}

export default AnimateBox
