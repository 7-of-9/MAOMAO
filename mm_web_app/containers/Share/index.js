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
  componentDidMount () {
    logger.warn('Share componentDidMount')
  }

  componentWillReact () {
    logger.warn('Share componentWillReact')
  }

  render () {
    return (
      <div>
        <button className='btn btn-back' onClick={() => { this.props.ui.backToStreams() }}>
          <i className='fa fa-angle-left' aria-hidden='true' />
        </button>
        <div className='share-management bounceInLeft animated'>
          <div className='block-back'>
            <h1> Share your streams with friend </h1>
          </div>
          <div className='container'>
            <ShareTopic
              type='Google'
              shareOption='all'
              currentStep={1}
              topics={[]}
              terms={[]}
              code=''
              sendEmail={() => {}}
              changeShareType={() => {}}
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
