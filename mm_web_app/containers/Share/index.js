/**
*
* Share
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import ShareTopic from '../../components/ShareTopic'
import logger from '../../utils/logger'

@inject('store')
@inject('ui')
@observer
class Share extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      type: 'Google',
      shareOption: 'site',
      currentStep: 1
    }
    this.changeShareType = this.changeShareType.bind(this)
  }

  componentDidMount () {
    logger.warn('Share componentDidMount')
    // TODO: get contacts from extension
  }

  componentWillReact () {
    logger.warn('Share componentWillReact')
  }

  changeShareType (type, shareOption, currentStep) {
    this.setState({
      type, shareOption, currentStep
    })
  }

  render () {
    return (
      <div>
        <button className='btn btn-back' onClick={() => { this.props.ui.backToStreams() }}>
          <i className='fa fa-angle-left' aria-hidden='true' />
        </button>
        <div className='share-management bounceInRight animated'>
          <div className='block-back'>
            <h1> Share your streams with friend </h1>
          </div>
          <div className='container'>
            <ShareTopic
              type={this.state.type}
              shareOption={this.state.shareOption}
              currentStep={this.state.currentStep}
              topics={[]}
              terms={[]}
              code=''
              sendEmail={() => {}}
              changeShareType={this.changeShareType}
              accessGoogleContacts={() => {}}
              contacts={[]}
              notify={() => {}}
              closeShare={() => {}}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Share
