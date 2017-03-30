import React from 'react';
import { pure, withState, withHandlers, compose } from 'recompose';
import PopoutWindow from 'react-popout';
import { GoogleShare, ShareOptions, Toolbar } from '../share';

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

function closeShareWindow() {
  console.log('closeShareWindow');
}

const enhance = compose(
  withState('recipients', 'updateRecipients', []),
  withHandlers({
    handleChange: props => (emails) => {
      props.updateRecipients(emails);
    },
    sendEmails: props => () => {
      if (props.recipients.length) {
        const topic = selectTopics(props.terms);
        props.recipients.forEach((item) => {
          // TODO: validate email addr
          props.sendEmail(item.name, item.email, topic);
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
   enable, type, terms, topic, contacts,
   handleChange, changeShareType, sendEmails, closeShare,
   accessGoogleContacts }) =>
     <div style={Object.assign({}, style.container, { display: enable ? '' : 'none' })}>
       <div className="maomao-logo" />
       <button
         onClick={closeShare} className="close_button"
       />
       <Toolbar active={type} onChange={changeShareType} />
       <h3 style={style.heading}>
        Share <span style={style.topic}>{selectTopics(terms)}</span> with:
      </h3>
       <ShareOptions tld={topic} />
       { type === 'Google' && contacts.length === 0 &&
       <div>
          You have no google contacts. Click
          <button onClick={accessGoogleContacts}> here </button>
           to grant permissions to access google contacts.
        </div>
        }
       {type === 'Google' && contacts.length > 0 &&
       <div>
         <GoogleShare contacts={contacts} handleChange={handleChange} />
         <button
           style={style.button}
           className="share-button"
           onClick={sendEmails}
         >
             Share Now!
           </button>
       </div>
       }
       {
         type === 'Facebook' &&
         <PopoutWindow url="https://www.facebook.com/sharer.php?u=http://maomao.rocks&hashtag=#maomao&quote=Are you ready to rocks?" title="Post to Facebook">
           <div>Loading...</div>
         </PopoutWindow>
       }
       { type === 'FacebookMessenger' &&
       <PopoutWindow url={`http://www.facebook.com/dialog/send?app_id=${FB_APP_ID}&display=popup&link=http://maomao.rocks&redirect_uri=http://maomao.rocks/`} title="Send a message">
         <div>Loading...{closeShareWindow()}</div>
       </PopoutWindow>
       }
     </div >,
);
export default ShareTopic;
