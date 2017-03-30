import React from 'react';
import { pure, withState, withHandlers, compose } from 'recompose';
import PopoutWindow from 'react-popout';
import ToggleDisplay from 'react-toggle-display';
import { GoogleShare, ShareOptions, Toolbar } from '../share';

const SITE_URL = 'http://maomao.rocks';
const FB_APP_ID = '386694335037120';
const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    minWidth: '600px',
    backgroundColor: '#dedede',
    border: '3px solid #3f51b5',
  },
  toolbar: {
    float: 'right',
  },
  topic: {
    fontWeight: 'bolder',
  },
  heading: {
    paddingLeft: '50px',
    height: '40px',
    width: 'fit-content',
    lineHeight: '40px',
    fontSize: '16px',
  },
  button: {
    float: 'right',
    textAlign: 'center',
  },
  chip: {
    margin: 4,
  },
  wrapper: {
    overflow: 'auto',
    maxHeight: '300px',
  },
};

const selectTopics = terms => terms && terms[0] && terms[0].text;

function closeSendMsgWindow() {
  console.log('closeSendMsgWindow');
}

const enhance = compose(
  withState('recipients', 'updateRecipients', []),
  withState('shareOption', 'updateShareOption', 'site'),
  withHandlers({
    shareUrl: props => () => {
      const url = `${SITE_URL}?code=${props.code[props.shareOption]}`;
      return `https://www.facebook.com/sharer.php?u=${encodeURI(url)}`;
    },
    sendMsgUrl: props => () => {
      const url = `${SITE_URL}?code=${props.code[props.shareOption]}`;
      return `http://www.facebook.com/dialog/send?app_id=${FB_APP_ID}&display=popup&link=${encodeURI(url)}&redirect_uri=${encodeURI(url)}`;
    },
    handleChange: props => (emails) => {
      props.updateRecipients(emails);
    },
    changeShareOption: props => (val) => {
      props.updateShareOption(val);
    },
    sendEmails: props => () => {
      if (props.recipients.length) {
        const topic = selectTopics(props.terms);
        const url = `${SITE_URL}?code=${props.code[props.shareOption]}`;
        props.recipients.forEach((item) => {
          // TODO: validate email addr
          props.sendEmail(item.name, item.email, topic, url);
        });
      } else {
        props.notify({
          title: 'Please choose your friends to send invitations!',
          autoHide: 3000,
        });
      }
    },
  }),
  pure,
);

const ShareTopic = enhance(({
   enable, type, terms, topic, contacts, code, shareOption,
   handleChange, changeShareType, changeShareOption, shareUrl, sendMsgUrl,
   sendEmails, closeShare, accessGoogleContacts }) =>
     <div style={Object.assign({}, style.container, { display: enable ? '' : 'none' })}>
       <div className="maomao-logo" />
       <button
         onClick={closeShare} className="close_button"
       />
       <Toolbar active={type} onChange={changeShareType} />
       <h3 style={style.heading}>
        Share <span style={style.topic}>{selectTopics(terms)}</span> with:
      </h3>
       <ShareOptions active={shareOption} topic={topic} onChange={changeShareOption} />
       <ToggleDisplay if={type === 'Google' && contacts.length === 0}>
         You have no google contacts. Click
         <button onClick={accessGoogleContacts}> here </button>
          to grant permissions to access google contacts.
       </ToggleDisplay>
       <ToggleDisplay if={type === 'Google' && contacts.length > 0}>
         <GoogleShare contacts={contacts} handleChange={handleChange} />
         <button
           style={style.button}
           className="share-button"
           onClick={sendEmails}
         >
             Share Now!
           </button>
       </ToggleDisplay>
       <ToggleDisplay if={type === 'Facebook'}>
         <PopoutWindow url={shareUrl()} title="Post to Facebook">
           <div>Loading...</div>
         </PopoutWindow>
       </ToggleDisplay>
       <ToggleDisplay if={type === 'FacebookMessenger'}>
         <PopoutWindow url={sendMsgUrl()} title="Send a message">
           <div>Loading...{closeSendMsgWindow()}</div>
         </PopoutWindow>
       </ToggleDisplay>
       <ToggleDisplay if={type === 'Link'}>
         <div>
           {SITE_URL}/?code={code[shareOption]}
         </div>
       </ToggleDisplay>
     </div >,
);
export default ShareTopic;
