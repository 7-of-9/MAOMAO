import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Flight, { Rect } from 'react-flight/dom'
import logger from '../../utils/logger'

class AnimateBox extends PureComponent {
  static propTypes = {
    duration: PropTypes.number,
    onBack: PropTypes.func
  }

  static defaultProps = {
    duration: 300,
    onBack: () => {}
  }

  render () {
    logger.info('AnimateBox render')
    return (
      <Flight interactive ref={flight => (this.flight = flight)}>
        <Flight.Frame duration={this.props.duration} source interactive>
          <div className='keyframe'>
            <Rect
              name='head-1'
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: 'auto',
                position: 'relative'
              }}
            >
              {this.props.children}
            </Rect>
            <div
              id='brace-1'
              className='brace-1'
              style={{
                color: '#95A2AA',
                top: 30,
                left: -50,
                fontSize: 30,
                height: 'auto',
                position: 'absolute'
              }}
            >
              <button className='btn' onClick={this.props.onBack}>
                <i className='fa fa-angle-left' aria-hidden='true' />
              </button>
            </div>
          </div>
        </Flight.Frame>
        <Flight.Frame duration={this.props.duration}>
          <div className='keyframe'>
            <Rect
              name='head-1'
              style={{
                left: -50,
                top: 0,
                width: 10,
                height: 10,
                position: 'absolute'
              }}
             />
          </div>
          <div
            id='brace-1'
            className='brace-1'
            style={{
              color: '#95A2AA',
              top: 30,
              left: 20,
              fontSize: 30
            }}
             />
        </Flight.Frame>
      </Flight>
    )
  }
}

export default AnimateBox
