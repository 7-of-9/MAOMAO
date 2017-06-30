/**
*
* BlockElement
*
*/

import React, { Component } from 'react'
import ReactPlaceholder from 'react-placeholder'
import 'react-placeholder/lib/reactPlaceholder.css'
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
    const { image } = this.props
    if (image) {
      /* global Image */
      const img = new Image()
      img.onload = () => {
        this.setState({ready: true})
      }
      img.onerror = () => {
        this.setState({ready: true})
      }
      img.src = image
    } else {
      this.setState({ready: true})
    }
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
