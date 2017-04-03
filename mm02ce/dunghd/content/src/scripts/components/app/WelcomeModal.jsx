import React, { PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import RaisedButton from 'material-ui/RaisedButton';
import { onlyUpdateForKeys, lifecycle, compose } from 'recompose';
import $ from 'jquery';
import Radium from 'radium';
import Paper from 'material-ui/Paper';
import { Card, CardActions, CardHeader, CardTitle } from 'material-ui/Card';

const customStyles = {
  title: {
    display: 'block',
    fontSize: '20px',
    margin: '20px 0px',
    color: '#000',
  },
  animateText: {
    color: '#999',
    fontFamily: 'Rokkitt',
    fontSize: '75px',
    textShadow: '0.025em 0.025em 0.025em rgba(0, 0, 0, 0.8)',
  },
  card: {
    backgroundColor: 'none',
    boxShadow: 'none',
  },
  cardAction: {
    padding: 'none',
  },
  overlay: {
    zIndex: 9999,
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    position: 'absolute',
    width: '400px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '1px solid rgb(204, 204, 204)',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
    textAlign: 'center',
  },
};

const propTypes = {
  auth: PropTypes.object,
  onGoogleLogin: PropTypes.func.isRequired,
  onFacebookLogin: PropTypes.func.isRequired,
  onLinkedFacebook: PropTypes.func.isRequired,
  onLinkedGoogle: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
  auth: {
    isLogin: false,
    googleToken: '',
    facebookToken: '',
    info: {},
  },
  isShareOpen: false,
  isOpen: false,
};

function WelcomeModal({
   auth, isOpen,
   onGoogleLogin, onFacebookLogin, onLinkedFacebook, onLinkedGoogle,
   onClose, onLogout }) {
  const networks = auth.accounts.map(item => item.providerId);
  return (
    <ToggleDisplay if={isOpen}>
      <div style={customStyles.overlay}>
        <Paper style={customStyles.content} zDepth={3}>
          <div className="maomao-logo" />
          <h1 className="tlt glow in" style={customStyles.animateText}>
            maomao
           </h1>
          <ToggleDisplay hide={auth.isLogin}>
            <h2 style={customStyles.title}>Join MaoMao!</h2>
            <RaisedButton onTouchTap={onGoogleLogin} label="Google Connect" />
            <br />
            <RaisedButton onTouchTap={onFacebookLogin} label="Facebook Connect" />
            <br />
            <RaisedButton onTouchTap={onClose} label="Close" />
          </ToggleDisplay>
          <ToggleDisplay show={auth.isLogin}>
            <Card style={customStyles.card}>
              <CardHeader
                style={customStyles.cardAction}
                title={auth.info.name}
                subtitle={auth.info.email}
                avatar={auth.info.picture}
              />
              <CardTitle title="Welcome back!" />
              <CardActions style={customStyles.cardAction}>
                { auth &&
                  !networks.includes('facebook.com') &&
                  <RaisedButton
                    onTouchTap={onLinkedFacebook} label="Facebook Connect"
                  />}
                { auth &&
                  !networks.includes('google.com') &&
                  <RaisedButton onTouchTap={onLinkedGoogle} label="Google Connect" />}
                <br />
                <RaisedButton onTouchTap={onLogout} label="Logout" />
                <br />
                <RaisedButton onTouchTap={onClose} label="Close" />
              </CardActions>
            </Card>
          </ToggleDisplay>
        </Paper>
      </div>
    </ToggleDisplay>
  );
}

WelcomeModal.propTypes = propTypes;
WelcomeModal.defaultProps = defaultProps;

const enhance = compose(
  lifecycle({
    componentDidMount() {
      $('.tlt').fitText(0.5).textillate();
    },
    componentDidUpdate() {
      $('.tlt').fitText(0.5).textillate();
    },
  }),
  onlyUpdateForKeys(['auth', 'isOpen']),
);

export default Radium(enhance(WelcomeModal));
