import React from 'react'
import PropTypes from 'prop-types'
import { withState } from 'recompose'
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

const enhance = withState('copied', 'setCopied', false)
const StepThree = enhance(({
  type, contacts, code, shareOption, copied,
  accessGoogleContacts, handleChange, sendEmails, changeShareType, setCopied }) => (
    <div>
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
            onCopy={() => setCopied(true)}
          >
            <div className='input-group-btn'>
              <button type='button' className='btn btn-copy'>Copy</button>
              {copied ? <span style={{ color: '#014cd6' }}>Copied.</span> : null}
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
              className='share-button'
              onClick={sendEmails}
            >
              Share Now !
          </button>
          </div>
        }
      </div>
    </div>
  ))

StepThree.propTypes = {
  type: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  contacts: PropTypes.array.isRequired,
  shareOption: PropTypes.string.isRequired,
  accessGoogleContacts: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  sendEmails: PropTypes.func.isRequired,
  changeShareType: PropTypes.func.isRequired
}

export default StepThree
