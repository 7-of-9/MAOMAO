import React from 'react';
import { pure, withState, withHandlers, compose } from 'recompose';
import { GoogleShare } from '../share';

const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    minWidth: '400px',
    maxHeight: '400px',
    backgroundColor: '#dedede',
    border: '3px solid #3f51b5',
  },
  topic: {
    fontWeight: 'bolder',
  },
  heading: {
    paddingLeft: '50px',
    fontSize: '20px',
    lineHeight: '40px',
    height: '50px',
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

const enhance = compose(
  withState('show', 'setDisplay', true),
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
  show, enable, setDisplay, terms, contacts, handleChange, sendEmails }) =>
    <div style={Object.assign({}, style.container, { display: show && enable ? '' : 'none' })}>
      <div className="maomao-logo" />
      <a onClick={() => setDisplay(() => false)} className="close_button" />
      <h3 style={style.heading}>
      Share <span style={style.topic}>{selectTopics(terms)}</span> with:
    </h3>
      <GoogleShare contacts={contacts} handleChange={handleChange} />
      <a style={style.button} className="share-button" onClick={sendEmails}>Share Now!</a>
    </div >,
);
export default ShareTopic;
