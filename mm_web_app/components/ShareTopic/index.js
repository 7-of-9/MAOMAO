import React from 'react'
import PropTypes from 'prop-types'
import { onlyUpdateForKeys, withState, withHandlers, compose } from 'recompose'
import { CSSTransitionGroup } from 'react-transition-group'
import Steps, { Step } from 'rc-steps'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import logger from '../../utils/logger'

const SITE_URL = 'https://maomaoweb.azurewebsites.net'
const style = {
  container: {
    backgroundColor: '#fff',
    textAlign: 'center'
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
    return 'just this url'
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

function ShareTopic ({
  type, topics, contacts, code, shareOption, currentStep,
  handleChange, shareUrl, sendMsgUrl, changeShareType, notify,
  sendEmails, closeShare, accessGoogleContacts }) {
  logger.info('ShareTopic type, topics, contacts, code, shareOption, currentStep', type, topics, contacts, code, shareOption, currentStep)
  const steps = [
    { title: 'Select your content', description: 'Share this page or topics with your friends.' },
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
  const component = (
    <div style={style.container}>
      <Steps className='share-steps' current={currentStep - 1} direction='vertical' size='small'>
        {steps}
      </Steps>
      <h3 className='share-title'>
          Share
              <em style={style.topic}> {selectTopics(topics, shareOption)} </em>
        {type && type.length > 0 && currentStep > 2 && `with friends by ${type}`}
      </h3>
      {currentStep && currentStep === 1 &&
      <StepOne
        shareOption={shareOption}
        type={type}
        code={code}
        topics={topics}
        changeShareType={changeShareType}
          />
        }
      {currentStep && currentStep === 2 &&
      <StepTwo
        shareOption={shareOption}
        type={type}
        changeShareType={changeShareType}
        />
        }
      {currentStep && currentStep === 3 &&
      <StepThree
        notify={notify}
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

ShareTopic.propTypes = {
  type: PropTypes.string.isRequired,
  shareOption: PropTypes.string.isRequired,
  code: PropTypes.object.isRequired,
  contacts: PropTypes.array.isRequired,
  topics: PropTypes.array.isRequired,
  currentStep: PropTypes.number.isRequired,
  sendEmail: PropTypes.func.isRequired,
  changeShareType: PropTypes.func.isRequired,
  accessGoogleContacts: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
  closeShare: PropTypes.func.isRequired
}
export default enhance(ShareTopic)
