/**
*
* BlockElement
*
*/

import React, { Component } from 'react'
import ReactPlaceholder from 'react-placeholder'
import { TextBlock, RectShape } from 'react-placeholder/lib/placeholders'

function awesomePlaceholder () {
  return (
    <div className='media-block'>
      <RectShape color='#CDCDCD' style={{width: '100%', height: 120}} />
      <TextBlock rows={3} color='#CDCDCD' />
    </div>
  )
}

class PlaceHolder extends Component {
  constructor (props) {
    super(props)
    this.state = { ready: false }
  }

  componentDidMount () {
    this._isMount = true
    const { image } = this.props
    if (image) {
      /* global Image */
      const img = new Image()
      img.onload = () => {
        if (this._isMount) {
          this.setState({ready: true})
        }
      }
      img.onerror = () => {
        if (this._isMount) {
          this.setState({ready: true})
        }
      }
      img.src = image
    } else {
      this.setState({ready: true})
    }
  }

  componentWillUnmount () {
    this._isMount = false
  }

  render () {
    return (
      <ReactPlaceholder
        showLoadingAnimation
        customPlaceholder={awesomePlaceholder()}
        ready={this.state.ready}>
        {this.props.children}
      </ReactPlaceholder>
    )
  }
}

export default PlaceHolder
