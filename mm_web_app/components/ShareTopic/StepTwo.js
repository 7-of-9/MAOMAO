import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import Toolbar from './Toolbar'

const style = {
  toolbar: {
    display: 'inline-block'
  }
}

const StepTwo = compose(({
  type, shareOption, shareUrl, sendMsgUrl, changeShareType
 }) =>
  (<div className='share-social'>
    <h3 className='share-social-title'>
      Click on button below to select.
      </h3>
    <div className='toolbar-button'>
      <Toolbar
        active={type}
        onChange={(value) => { changeShareType(value, shareOption, 3) }}
        onShare={shareUrl}
        onSendMsg={sendMsgUrl}
        style={style.toolbar}
      />
    </div>
    <div className='share-footer'>
      <button
        className='btn btn-slide-prev'
        onClick={() => changeShareType(type, shareOption, 1)}
      >
        Previous
      </button>
    </div>
  </div>
  ))

StepTwo.propTypes = {
  type: PropTypes.string.isRequired,
  shareOption: PropTypes.string.isRequired,
  sendMsgUrl: PropTypes.func.isRequired,
  shareUrl: PropTypes.func.isRequired,
  changeShareType: PropTypes.func.isRequired
}

export default StepTwo
