import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Flight, { Rect } from 'react-flight/dom'
import logger from '../../utils/logger'

class AnimateBox extends PureComponent {
  static propTypes = {
    duration: PropTypes.number
  }

  static defaultProps = {
    duration: 300
  }

  render () {
    logger.warn('AnimateBox render')
    return (
      <Flight interactive ref={flight => (this.flight = flight)}>
        <Flight.Frame duration={this.props.duration} source interactive>
          <div className='keyframe'>
            <Rect
              name='head-1'
              radius={5}
              style={{
                backgroundColor: '#fff',
                left: 30 - 20,
                top: 20,
                width: 50,
                height: 10
              }}
            >
              {this.props.children}
            </Rect>
          </div>
        </Flight.Frame>
        <Flight.Frame duration={this.props.duration}>
          <div className='keyframe'>
            <Rect
              name='head-1'
              radius={5}
              style={{
                backgroundColor: '#fff',
                left: -60,
                top: 20,
                width: 50,
                height: 10
              }}
            >
              {this.props.children}
            </Rect>
          </div>
        </Flight.Frame>

      </Flight>
    )
  }
}

export default AnimateBox
