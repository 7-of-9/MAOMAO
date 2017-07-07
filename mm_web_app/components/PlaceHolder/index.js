/**
*
* BlockElement
*
*/

import React, { PureComponent } from 'react'
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

class PlaceHolder extends PureComponent {
  state = {
    ready: false
  }

  componentDidMount () {
    this.setState({ ready: true })
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
