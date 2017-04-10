import React from 'react';
import { onlyUpdateForKeys, withState, withHandlers, compose } from 'recompose';
import ToggleDisplay from 'react-toggle-display';
import CopyToClipboard from 'react-copy-to-clipboard';
import { GoogleShare, ShareOptions, Toolbar } from '../share';
import openUrl from '../utils/popup';

const SITE_URL = 'https://maomaoweb.azurewebsites.net';
const FB_APP_ID = '386694335037120';
const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    margin: '-250px 0 0 -321px',
    zIndex: 1000,
    width: '642px',
    backgroundColor: '#fff',
    border: '1px solid rgb(204, 204, 204)',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 10px 30px, rgba(0, 0, 0, 0.3) 0px 6px 10px',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '7px',
    outline: 'none',
    padding: '20px',
    textAlign: 'center',
    animation: 'vex-flyin 0.5s',
  },
  toolbar: {
    display: 'inline-block',
  },
  topic: {
    fontWeight: 'bolder',
  },
  heading: {
    padding: '0 50px',
    lineHeight: '30px',
    fontSize: '25px',
    margin: '20px 0 15px',
    overflow: 'hidden',
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

const selectTopics = (topics, type) => {
  if (type === 'site') {
   return 'just this site';
  }
  const currentTopic = topics.find(item => item.id === type);
  return currentTopic.name;
};

const enhance = compose(
  withState('recipients', 'updateRecipients', []),
  withState('shareOption', 'updateShareOption', 'site'),
  withHandlers({
    shareUrl: props => () => {
      const url = `${SITE_URL}/${props.code[props.shareOption]}`;
      const src = `https://www.facebook.com/sharer.php?u=${encodeURI(url)}`;
      openUrl(src);
      props.closeShare();
    },
    sendMsgUrl: props => () => {
      const url = `${SITE_URL}/${props.code[props.shareOption]}`;
      const closePopupUrl = `${SITE_URL}/${props.code[props.shareOption]}?close=popup`;
      const src = `https://www.facebook.com/dialog/send?app_id=${FB_APP_ID}&display=popup&link=${encodeURI(url)}&redirect_uri=${encodeURI(closePopupUrl)}`;
      openUrl(src);
      props.closeShare();
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
        const url = `${SITE_URL}/${props.code[props.shareOption]}`;
        props.recipients.forEach((item) => {
          // TODO: validate email addr
          props.sendEmail(item.name, item.email, topic, url);
        });
        props.closeShare();
      } else {
        props.notify({
          title: 'Please choose your friends to send invitations!',
          autoHide: 3000,
        });
      }
    },
  }),
  onlyUpdateForKeys(['contacts', 'code', 'type', 'shareOption']),
);

const ShareTopic = enhance(({
   enable, type, topics, contacts, code, shareOption,
   handleChange, changeShareType, changeShareOption, shareUrl, sendMsgUrl,
   sendEmails, closeShare, accessGoogleContacts }) =>
     <div style={Object.assign({}, style.container, { display: enable && type.indexOf('Facebook') === -1 ? '' : 'none' })}>
       <div className="maomao-logo" />
       <button
         onClick={closeShare} className="close_button"
       />
       <h3 style={style.heading}>
         <span className="fancy">
           <span
             className="fancy-line"
           >Share
             <em style={style.topic}>{selectTopics(topics, shareOption)}</em> with
           </span>
         </span>
       </h3>
       <div className="toolbar-button">
         <Toolbar
           active={type}
           onChange={changeShareType}
           onShare={shareUrl}
           onSendMsg={sendMsgUrl}
           style={style.toolbar}
         />
       </div>
       <ShareOptions active={shareOption} topics={topics} onChange={changeShareOption} />
       <ToggleDisplay className="link-share-option" if={type === 'Google' && contacts.length === 0}>
         You have no google contacts. Click
         <button className="btn-global btn-here" onClick={accessGoogleContacts}> here </button>
          to grant permissions to access google contacts.
       </ToggleDisplay>
       <ToggleDisplay if={type === 'Google' && contacts.length > 0}>
         <GoogleShare
           mostRecentUses={contacts.slice(0, 3)}
           contacts={contacts}
           handleChange={handleChange}
         />
         <button
           style={style.button}
           className="share-button"
           onClick={sendEmails}
         >
          Share Now!
         </button>
       </ToggleDisplay>
       <ToggleDisplay className="link-share-option" if={type === 'Link'}>
         <div className="input-group">
           <input className="form-control" value={`${SITE_URL}/${code[shareOption]}`} />
           <CopyToClipboard
             text={`${SITE_URL}/${code[shareOption]}`}
           >
             <div className="input-group-btn"><button className="btn-copy">Copy</button></div>
           </CopyToClipboard>
         </div>
       </ToggleDisplay>
     </div >,
);
export default ShareTopic;
