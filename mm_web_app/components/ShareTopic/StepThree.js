import React from 'react'
import PropTypes from 'prop-types'
import ToggleDisplay from 'react-toggle-display'
import CopyToClipboard from 'react-copy-to-clipboard'
import GoogleShare from './GoogleShare'

const SITE_URL = 'https://maomaoweb.azurewebsites.net'
const style = {
  button: {
    float: 'right',
    textAlign: 'center'
  }
}

const selectUrl = (code, shareOption) => code[shareOption]

const StepThree = ({
  type, contacts, code, shareOption,
  accessGoogleContacts, handleChange, sendEmails, changeShareType, notify }) => (
    <div className='modifier-autosuggest'>
      <ToggleDisplay className='link-share-option' show={type === 'Google' && contacts.length === 0}>
        You have no google contacts. Click
        <button type='button' className='btn btn-copy mr7 ml7' onClick={accessGoogleContacts}> here </button>
        to grant permissions to access google contacts.
      </ToggleDisplay>
      <ToggleDisplay show={type === 'Google' && contacts.length > 0}>
        <div className='panel-account'>
          <GoogleShare
            mostRecentUses={contacts.slice(0, 3)}
            contacts={contacts}
            handleChange={handleChange}
          />
        </div>
      </ToggleDisplay>
      <ToggleDisplay className='link-share-option' show={type === 'Link'}>
        <div className='input-group'>
          <input
            className='form-control'
            value={`${SITE_URL}/${selectUrl(code, shareOption)}`}
            readOnly
          />
          <CopyToClipboard
            text={`${SITE_URL}/${selectUrl(code, shareOption)}`}
            onCopy={() => notify(`You've just copied the link ${SITE_URL}/${selectUrl(code, shareOption)}`)}
          >
            <div className='input-group-btn'>
              <button type='button' className='btn btn-copy'>Copy</button>
            </div>
          </CopyToClipboard>
        </div>
      </ToggleDisplay>
      <div className='share-footer'>
        <button
          className='btn btn-slide-prev'
          onClick={() => changeShareType(type, shareOption, 2)}
        >
          Previous
        </button>
        {type === 'Google' && contacts.length > 0 &&
          <div className='share-now'>
            <button
              style={style.button}
              className='btn share-button'
              onClick={sendEmails}
            >
              Share Now !
          </button>
          </div>
        }
      </div>
    </div>
  )

StepThree.propTypes = {
  type: PropTypes.string.isRequired,
  code: PropTypes.object.isRequired,
  contacts: PropTypes.array.isRequired,
  shareOption: PropTypes.string.isRequired,
  accessGoogleContacts: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
  sendEmails: PropTypes.func.isRequired,
  changeShareType: PropTypes.func.isRequired
}

export default StepThree
