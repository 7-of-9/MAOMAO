import React from 'react'
import PropTypes from 'prop-types'
import { onlyUpdateForKeys, withState, withHandlers, compose } from 'recompose'
import { CSSTransitionGroup } from 'react-transition-group'
import ToggleDisplay from 'react-toggle-display'
import Steps, { Step } from 'rc-steps'
import CopyToClipboard from 'react-copy-to-clipboard'
import { GoogleShare, Toolbar } from '../../components/Share'
import logger from '../../utils/logger'
import openUrl from '../../utils/popup'

const SITE_URL = 'https://maomaoweb.azurewebsites.net'
const FB_APP_ID = '386694335037120'
const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    margin: '-290px 0 0 -400px',
    zIndex: 9999999999,
    width: '800px',
    backgroundColor: '#fff',
    border: '1px solid rgb(204, 204, 204)',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 10px 30px, rgba(0, 0, 0, 0.3) 0px 6px 10px',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '7px',
    outline: 'none',
    padding: '20px',
    textAlign: 'center',
    animation: 'vex-flyin 0.5s'
  },
  toolbar: {
    display: 'inline-block'
  },
  topic: {
    fontWeight: 'bolder'
  },
  heading: {
    padding: '0 50px',
    lineHeight: '30px',
    fontSize: '25px',
    margin: '20px 0 15px',
    overflow: 'hidden'
  },
  button: {
    float: 'right',
    textAlign: 'center'
  },
  chip: {
    margin: 4
  },
  wrapper: {
    overflow: 'auto',
    maxHeight: '300px'
  }
}

const selectTopics = (topics, type) => {
  if (type === 'site') {
    return 'just this page'
  }
  if (type === 'all') {
    return 'My browsing history'
  }
  const currentTopic = topics.find(item => item.id === type)
  return currentTopic && currentTopic.name
}

const selectUrl = (code, shareOption) => code[shareOption]

const enhance = compose(
  withState('recipients', 'updateRecipients', []),
  withHandlers({
    shareUrl: props => () => {
      const url = `${SITE_URL}/${selectUrl(props.code, props.shareOption)}`
      const closePopupUrl = `${SITE_URL}/static/success.html`
      const src = `https://www.facebook.com/dialog/share?app_id=${FB_APP_ID}&display=popup&href=${encodeURI(url)}&redirect_uri=${encodeURI(closePopupUrl)}&hashtag=${encodeURI('#maomao.rocks')}`
      openUrl(src)
      props.closeShare()
    },
    sendMsgUrl: props => () => {
      const url = `${SITE_URL}/${selectUrl(props.code, props.shareOption)}`
      const closePopupUrl = `${SITE_URL}/static/success.html`
      const src = `https://www.facebook.com/dialog/send?app_id=${FB_APP_ID}&display=popup&link=${encodeURI(url)}&redirect_uri=${encodeURI(closePopupUrl)}`
      openUrl(src)
      props.closeShare()
    },
    handleChange: props => (emails) => {
      props.updateRecipients(emails)
    },
    sendEmails: props => () => {
      if (props.recipients.length) {
        let topic = selectTopics(props.topics, props.shareOption)
        if (topic === 'just this page') {
          topic = document.title
        }
        const url = `${SITE_URL}/${selectUrl(props.code, props.shareOption)}`
        props.recipients.forEach((item) => {
          // TODO: validate email addr
          props.sendEmail(item.name, item.email, topic, url)
        })
        props.closeShare()
      } else {
        props.notify({
          title: 'Please choose your friends to send invitations!',
          autoHide: 3000
        })
      }
    }
  }),
  onlyUpdateForKeys(['contacts', 'currentStep', 'code', 'type', 'shareOption'])
)

const ShareTopicStepOne = compose(({
  type, shareOption, shareUrl, sendMsgUrl, changeShareType
 }) =>
  (<div className='share-social'>
    <h3 className='share-social-title'>
      Click on button below to select.
      </h3>
    <div className='toolbar-button'>
      <Toolbar
        active={type}
        onChange={(value) => { changeShareType(value, shareOption, 2) }}
        onShare={shareUrl}
        onSendMsg={sendMsgUrl}
        style={style.toolbar}
      />
    </div>
  </div>
  ))

const enhance2 = withState('copied', 'setCopied', false)
const ShareTopicStepTwo = enhance2(({
  type, contacts, code, shareOption, copied,
  accessGoogleContacts, handleChange, sendEmails, changeShareType, setCopied }) => (
    <div>
      <ToggleDisplay className='link-share-option' show={type === 'Google' && contacts.length === 0}>
        You have no google contacts. Click
        <button className='btn-copy' onClick={accessGoogleContacts}> here </button>
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
              <button className='btn-copy'>Copy</button>
              {copied ? <span style={{ color: '#014cd6' }}>Copied.</span> : null}
            </div>
          </CopyToClipboard>
        </div>
      </ToggleDisplay>
      <div className='share-footer'>
        <button
          className='btn btn-slide-prev'
          onClick={() => changeShareType(type, shareOption, 1)}
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

const ShareTopic = enhance(({
  enable, type, topics, contacts, code, shareOption, currentStep,
  handleChange, shareUrl, sendMsgUrl, changeShareType,
  sendEmails, closeShare, accessGoogleContacts }) => {
  logger.info('ShareTopic enable, type, topics, contacts, code, shareOption, currentStep', enable, type, topics, contacts, code, shareOption, currentStep)
  const steps = [
    { title: 'Choose the way to sharing with friends', description: 'Use Facebook, Gmail or get direct link.' },
    { title: 'Finish', description: 'Ready to share' }
  ].map(item => (
    <Step
      key={item.title}
      status={item.status}
      title={item.title}
      description={item.description}
    />
  ))
  let component = null
  if (enable && type.indexOf('Facebook') === -1) {
    component = (
      <div style={style.container}>
        <a href='http://maomao.rocks' target='_blank' rel='noopener noreferrer'>
          <div className='maomao-logo' />
        </a>
        <a className='close_popup' onClick={closeShare}><i className='icons-close' /></a>
        <Steps className='share-steps' current={currentStep - 1} direction='vertical' size='small'>
          {steps}
        </Steps>
        <h3 className='share-title'>
          Share
              <em style={style.topic}> {selectTopics(topics, shareOption)} </em>
          {type && type.length > 0 && currentStep > 2 && `with friends by ${type}`}
        </h3>
        {currentStep && currentStep === 1 &&
          <ShareTopicStepOne
            shareOption={shareOption}
            type={type}
            changeShareType={changeShareType}
            shareUrl={shareUrl}
            sendMsgUrl={sendMsgUrl}
          />
        }
        {currentStep && currentStep === 2 &&
          <ShareTopicStepTwo
            shareOption={shareOption}
            type={type}
            contacts={contacts}
            changeShareType={changeShareType}
            code={code}
            handleChange={handleChange}
            sendEmails={sendEmails}
            accessGoogleContacts={accessGoogleContacts}
          />
        }
      </div>
    )
  }
  return (
    <CSSTransitionGroup
      transitionName='maomao'
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}
    >
      {component}
    </CSSTransitionGroup>
  )
}
)

ShareTopic.propTypes = {
  enable: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  shareOption: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  contacts: PropTypes.array.isRequired,
  topics: PropTypes.array.isRequired,
  terms: PropTypes.array.isRequired,
  currentStep: PropTypes.number.isRequired,
  sendEmail: PropTypes.func.isRequired,
  changeShareType: PropTypes.func.isRequired,
  accessGoogleContacts: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
  closeShare: PropTypes.func.isRequired
}
export default ShareTopic
